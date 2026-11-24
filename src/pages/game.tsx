import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import Layout from "../components/Layout";
import Board from "../components/Board";
import BombIcon from "../components/icons/BombIcon";
import LetterSlots from "../components/LetterSlots";
import VirtualKeyboard from "../components/VirtualKeyboard";
import HowToPlayCollapse from "../components/HowToPlayCollapse";
import { useMinadoBoard } from "../hooks/useMinadoBoard";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useIsMobile } from "../hooks/useIsMobile";
import { TODAY_PUZZLE } from "../data/dailyPuzzle";
import { MinadoGrid } from "../game/types";
import { buildShareText } from "../utils/shareText";

const ACCENT = "#e74c3c";

type ClueStatus = "pending" | "correct" | "wrong" | "passed";

interface ClueResult {
  word: string;
  foundLetters: string[];
  grid: MinadoGrid | null;
  status: ClueStatus;
}

function normalize(word: string): string {
  return word.trim().toUpperCase();
}

function initialResults(): ClueResult[] {
  return TODAY_PUZZLE.clueWords.map((word) => ({ word, foundLetters: [], grid: null, status: "pending" }));
}

type Stage = "select" | "board" | "finalGuess" | "done";

export default function Game() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stage, setStage] = useState<Stage>("select");
  const [results, setResults] = useState<ClueResult[]>(initialResults);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [finalCorrect, setFinalCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  // En mobile no hay botón derecho — este toggle decide si un toque
  // revela o marca con bandera. En desktop el click derecho marca
  // siempre, sin importar este modo (ver Board). Se resetea a "revelar"
  // en cada pista nueva para no arrancar marcando por accidente.
  const [flagMode, setFlagMode] = useState(false);

  // --- Minitablero de la pista activa (solo relevante en stage "board") ---
  const activeWord = activeIndex !== null ? TODAY_PUZZLE.clueWords[activeIndex] : TODAY_PUZZLE.clueWords[0];
  const board = useMinadoBoard(activeWord);

  useEffect(() => {
    setFlagMode(false);
  }, [activeIndex]);

  // El tablero y el intento de adivinar viven en la misma pantalla ahora
  // (ya no hay una pantalla separada "clueGuess") — esto solo mantiene
  // `results[activeIndex]` al día con el progreso real del tablero, para
  // que la lista de las 4 pistas en "adivinar palabra final" y el texto
  // para compartir tengan la foto correcta aunque el jugador nunca haya
  // "confirmado" nada todavía.
  useEffect(() => {
    if (activeIndex === null) return;
    setResults((prev) => {
      const next = [...prev];
      next[activeIndex] = { ...next[activeIndex], foundLetters: board.foundLetters, grid: board.grid };
      return next;
    });
  }, [activeIndex, board.foundLetters, board.grid]);

  // --- Respuesta tipeada (pista individual o palabra final) — mismo
  // patrón que enroscaloReact: casillas + teclado físico/virtual, con la
  // misma protección contra el bug de Enter (un array de largo
  // equivocado, de una respuesta anterior, se ignora en vez de
  // confirmarse solo). ---
  const answerLength = stage === "finalGuess" ? TODAY_PUZZLE.answer.length : activeIndex !== null ? results[activeIndex].word.length : 0;
  const [answerChars, setAnswerChars] = useState<string[]>([]);

  useEffect(() => {
    if (stage === "board" || stage === "finalGuess") {
      setAnswerChars(Array.from({ length: answerLength }, () => ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, activeIndex]);

  const commitClueAnswer = useCallback(
    (chars: string[]) => {
      if (activeIndex === null) return;
      if (chars.length !== results[activeIndex].word.length) return;
      if (chars.some((ch) => ch.length === 0)) return;
      const correct = normalize(chars.join("")) === normalize(results[activeIndex].word);
      setResults((prev) => {
        const next = [...prev];
        next[activeIndex] = { ...next[activeIndex], status: correct ? "correct" : "wrong" };
        return next;
      });
      setStage("select");
    },
    [activeIndex, results],
  );

  const commitFinalAnswer = useCallback((chars: string[]) => {
    if (chars.length !== TODAY_PUZZLE.answer.length) return;
    if (chars.some((ch) => ch.length === 0)) return;
    const correct = normalize(chars.join("")) === normalize(TODAY_PUZZLE.answer);
    setFinalCorrect(correct);
    setStage("done");
  }, []);

  const handleKeyInput = useCallback(
    (rawKey: string) => {
      if (stage !== "board" && stage !== "finalGuess") return;
      const commit = stage === "finalGuess" ? commitFinalAnswer : commitClueAnswer;

      if (rawKey === "{enter}") {
        commit(answerChars);
        return;
      }
      if (rawKey === "{bksp}") {
        setAnswerChars((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i]) {
              next[i] = "";
              break;
            }
          }
          return next;
        });
        return;
      }
      const key = rawKey.toUpperCase();
      if (!/^[A-ZÑ]$/.test(key)) return;

      setAnswerChars((prev) => {
        const fillIndex = prev.findIndex((ch) => !ch);
        if (fillIndex < 0) return prev;
        const next = [...prev];
        next[fillIndex] = key;
        if (next.every((ch) => ch.length > 0)) commit(next);
        return next;
      });
    },
    [stage, answerChars, commitClueAnswer, commitFinalAnswer],
  );

  usePhysicalKeyboard({ onKeyPress: handleKeyInput, enabled: stage === "board" || stage === "finalGuess" });

  function handlePass() {
    if (activeIndex === null) return;
    setResults((prev) => {
      const next = [...prev];
      next[activeIndex] = { ...next[activeIndex], status: "passed" };
      return next;
    });
    setStage("select");
  }

  function handleCopyShare() {
    const grids = results.map((r) => r.grid).filter((g): g is MinadoGrid => g !== null);
    const text = buildShareText(grids, finalCorrect === true);
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const statusLabel: Record<ClueStatus, string> = {
    pending: "Sin jugar",
    correct: "¡Resuelta!",
    wrong: "Incorrecta",
    passed: "Pasada",
  };

  return (
    <Layout>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ backgroundColor: "#fff", borderRadius: 4, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {stage === "select" && (
            <>
              <Typography sx={{ fontWeight: 800, color: "#333", textAlign: "center", fontSize: 20 }}>
                Elegí una pista
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                {results.map((r, i) => {
                  const done = r.status !== "pending";
                  return (
                    <Button
                      key={i}
                      onClick={() => {
                        setActiveIndex(i);
                        setStage("board");
                      }}
                      variant="contained"
                      sx={{
                        flexDirection: "column",
                        gap: 0.5,
                        py: 2,
                        borderRadius: 3,
                        backgroundColor: done ? (r.status === "correct" ? "#2ecc71" : "#999") : ACCENT,
                        "&:hover": { backgroundColor: done ? (r.status === "correct" ? "#27ae60" : "#888") : "#c0392b" },
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Pista {i + 1}</Typography>
                      <Typography sx={{ fontSize: 12, opacity: 0.9 }}>{statusLabel[r.status]}</Typography>
                    </Button>
                  );
                })}
              </Box>
              <Button
                onClick={() => setStage("finalGuess")}
                variant="contained"
                sx={{ backgroundColor: "#333", fontWeight: 800, borderRadius: 999, py: 1.4, mt: 1 }}
              >
                Adivinar palabra final
              </Button>
            </>
          )}

          {stage === "board" && activeIndex !== null && (
            <>
              <Typography sx={{ fontWeight: 800, color: "#333" }}>Pista {activeIndex + 1}</Typography>

              <Typography sx={{ textAlign: "center", color: "#777", fontSize: 13 }}>
                {isMobile
                  ? "Bandera suma la letra sin arriesgar · Revelar una letra es una bomba"
                  : "Click derecho suma la letra sin arriesgar · tocar una letra directo es una bomba"}
              </Typography>

              {isMobile && (
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  <Button
                    onClick={() => setFlagMode(false)}
                    startIcon={<SearchRoundedIcon />}
                    sx={{
                      flex: 1, maxWidth: 160, borderRadius: 999, fontWeight: 800,
                      border: `2px solid ${ACCENT}`,
                      backgroundColor: flagMode ? "transparent" : ACCENT,
                      color: flagMode ? ACCENT : "#fff",
                      "&:hover": { backgroundColor: flagMode ? "rgba(231,76,60,0.08)" : "#c0392b" },
                    }}
                  >
                    Revelar
                  </Button>
                  <Button
                    onClick={() => setFlagMode(true)}
                    startIcon={<FlagRoundedIcon />}
                    sx={{
                      flex: 1, maxWidth: 160, borderRadius: 999, fontWeight: 800,
                      border: `2px solid ${ACCENT}`,
                      backgroundColor: flagMode ? ACCENT : "transparent",
                      color: flagMode ? "#fff" : ACCENT,
                      "&:hover": { backgroundColor: flagMode ? "#c0392b" : "rgba(231,76,60,0.08)" },
                    }}
                  >
                    Bandera
                  </Button>
                </Box>
              )}

              <Board
                grid={board.grid}
                interactive={board.phase === "playing"}
                flagMode={flagMode}
                onReveal={(r, c) => board.revealCell({ r, c })}
                onFlag={(r, c) => board.flagCell({ r, c })}
              />

              <LetterSlots found={board.foundLetters} totalSlots={activeWord.length} />

              {board.phase === "solved" && (
                <Typography sx={{ textAlign: "center", color: "#2ecc71", fontWeight: 800 }}>
                  ¡Encontraste todas las letras!
                </Typography>
              )}
              {board.phase === "lost" && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: ACCENT, fontWeight: 800 }}>
                  <BombIcon fontSize="small" />
                  <Typography sx={{ color: "inherit", fontWeight: "inherit" }}>
                    ¡Pisaste una bomba! Vamos a adivinar con lo que encontraste.
                  </Typography>
                </Box>
              )}

              <Typography sx={{ fontWeight: 800, color: "#333", textAlign: "center", mt: 1 }}>
                ¿Cuál es la pista {activeIndex + 1}?
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                {answerChars.map((ch, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 42, height: 42, borderRadius: "8px",
                      border: `2px solid ${ACCENT}`, backgroundColor: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 18, color: "#333",
                    }}
                  >
                    {ch}
                  </Box>
                ))}
              </Box>

              <VirtualKeyboard onKeyPress={handleKeyInput} />

              <Button onClick={handlePass} sx={{ color: "#777", fontWeight: 700 }}>
                Pasapalabra
              </Button>
            </>
          )}

          {stage === "finalGuess" && (
            <>
              <Typography sx={{ fontWeight: 800, color: "#333", textAlign: "center" }}>
                ¿Cuál es la palabra final?
              </Typography>

              {results.map((r, i) => (
                <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center" }}>
                  <Typography sx={{ fontSize: 11, color: "#999", fontWeight: 700 }}>PISTA {i + 1}</Typography>
                  <LetterSlots found={r.foundLetters} totalSlots={r.word.length} />
                </Box>
              ))}

              <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                {answerChars.map((ch, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 42, height: 42, borderRadius: "8px",
                      border: `2px solid ${ACCENT}`, backgroundColor: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 18, color: "#333",
                    }}
                  >
                    {ch}
                  </Box>
                ))}
              </Box>

              <VirtualKeyboard onKeyPress={handleKeyInput} />
            </>
          )}

          {stage === "done" && (
            <>
              <Typography sx={{ fontSize: 40, textAlign: "center" }}>{finalCorrect ? "🎉" : "😕"}</Typography>
              <Typography sx={{ textAlign: "center", fontWeight: 800, color: finalCorrect ? "#2ecc71" : ACCENT }}>
                {finalCorrect ? "¡Correcto!" : `Era: ${TODAY_PUZZLE.answer}`}
              </Typography>
              <Button onClick={handleCopyShare} variant="contained" sx={{ backgroundColor: "#333", fontWeight: 800, borderRadius: 999, py: 1.2 }}>
                {copied ? "¡Copiado!" : "Compartir resultado"}
              </Button>
              <Button onClick={() => navigate("/")} sx={{ color: "#777", fontWeight: 700 }}>
                Volver al inicio
              </Button>
            </>
          )}
        </Box>

        {stage === "select" && (
          <HowToPlayCollapse
            title="¿Cómo jugar?"
            body="Tocá una celda simple para revelarla: siempre es segura y te muestra un número (cuántas letras hay en sus vecinas) — si da 0, destapa en bloque sus vecinas. Pero si tocás directo una celda de letra sin marcarla antes, ¡es una bomba! Perdés esa pista y pasás a adivinar con las letras que ya habías encontrado hasta ese momento. Para sumar una letra sin arriesgar, marcála con bandera en vez de tocarla: en computadora, click derecho; en el celular, activá el modo Bandera arriba del tablero. Al marcarla, la grilla solo muestra la banderita (no la letra) — la letra aparece recién abajo, en la lista de encontradas. En cualquier momento podés intentar adivinar la pista con las letras que ya tengas."
          />
        )}
      </Box>
    </Layout>
  );
}
