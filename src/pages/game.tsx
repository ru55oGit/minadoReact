import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Layout from "../components/Layout";
import Board from "../components/Board";
import MineIcon from "../components/icons/MineIcon";
import ClassicFlagIcon from "../components/icons/ClassicFlagIcon";
import DraggableLetters from "../components/DraggableLetters";
import VirtualKeyboard from "../components/VirtualKeyboard";
import HowToPlayCollapse from "../components/HowToPlayCollapse";
import { useMinadoBoard } from "../hooks/useMinadoBoard";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useIsMobile } from "../hooks/useIsMobile";
import { GRID_SIZE } from "../game/grid";
import { TODAY_PUZZLE } from "../data/dailyPuzzle";
import { buildShareText } from "../utils/shareText";
import { getRecommendedBreakPoint, getSyllableBreakPoint } from "../utils/syllableBreak";

const ACCENT = "#e74c3c";

// Las 4 palabras-pista viven ahora en UNA sola grilla (combinadas en un
// solo string) — esto precalcula en qué rango de esa palabra combinada
// cae cada pista, para poder separar después las letras encontradas por
// pista a partir de su `sourceIndex` (ver types.ts/useMinadoBoard.ts).
function buildClueRanges(words: string[]) {
  let offset = 0;
  return words.map((word) => {
    const range = { start: offset, length: word.length };
    offset += word.length;
    return range;
  });
}

const COMBINED_WORD = TODAY_PUZZLE.clueWords.join("");
const CLUE_RANGES = buildClueRanges(TODAY_PUZZLE.clueWords);

function normalize(word: string): string {
  return word.trim().toUpperCase();
}

type Stage = "play" | "done";

export default function Game() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stage, setStage] = useState<Stage>("play");
  const [finalCorrect, setFinalCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  // En mobile no hay botón derecho — este toggle decide si un toque
  // revela o marca con bandera. En desktop el click derecho marca
  // siempre, sin importar este modo (ver Board).
  const [flagMode, setFlagMode] = useState(false);
  // El teclado virtual se abre/cierra como overlay, igual que en los
  // otros juegos del hub (no vive siempre montado en la pantalla).
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  // Para el corte por sílaba de la palabra final (ver más abajo) — mismo
  // patrón que enroscaloReact: recalcula cuántas casillas entran por fila
  // según el ancho real de la ventana.
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const board = useMinadoBoard(COMBINED_WORD, GRID_SIZE + 1);

  // Letras encontradas de cada pista, en el orden que el jugador eligió
  // verlas — arranca en orden de descubrimiento y el jugador puede
  // reordenarlas arrastrando (DraggableLetters) para "leer" la palabra
  // aunque las haya encontrado salteadas. Cuando aparece una letra nueva
  // de esa pista se agrega al final, sin tocar el orden que ya armó.
  const [clueOrders, setClueOrders] = useState<string[][]>(() => TODAY_PUZZLE.clueWords.map(() => []));

  useEffect(() => {
    setClueOrders((prev) =>
      CLUE_RANGES.map((range, i) => {
        const rawFound = board.foundLetters.filter(
          (f) => f.sourceIndex >= range.start && f.sourceIndex < range.start + range.length,
        );
        if (rawFound.length <= prev[i].length) return prev[i];
        const newOnes = rawFound.slice(prev[i].length).map((f) => f.letter);
        return [...prev[i], ...newOnes];
      }),
    );
  }, [board.foundLetters]);

  function handleReorderClue(index: number, next: string[]) {
    setClueOrders((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
  }

  // --- Respuesta tipeada (la palabra final, la única que se "confirma"
  // ahora) — mismo patrón que enroscaloReact: casillas + teclado
  // físico/virtual, con la misma protección contra el bug de Enter (un
  // array de largo equivocado, de una respuesta anterior, se ignora en
  // vez de confirmarse solo). ---
  const [answerChars, setAnswerChars] = useState<string[]>(() => Array.from({ length: TODAY_PUZZLE.answer.length }, () => ""));

  const commitFinalAnswer = useCallback((chars: string[]) => {
    if (chars.length !== TODAY_PUZZLE.answer.length) return;
    if (chars.some((ch) => ch.length === 0)) return;
    const correct = normalize(chars.join("")) === normalize(TODAY_PUZZLE.answer);
    setFinalCorrect(correct);
    setKeyboardOpen(false);
    setStage("done");
  }, []);

  const handleKeyInput = useCallback(
    (rawKey: string) => {
      if (stage !== "play") return;

      if (rawKey === "{enter}") {
        commitFinalAnswer(answerChars);
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
        if (next.every((ch) => ch.length > 0)) commitFinalAnswer(next);
        return next;
      });
    },
    [stage, answerChars, commitFinalAnswer],
  );

  usePhysicalKeyboard({ onKeyPress: handleKeyInput, enabled: stage === "play" });

  function handleCopyShare() {
    const text = buildShareText([board.grid], finalCorrect === true);
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Corte por sílaba de la palabra final si no entra en una sola fila —
  // portado tal cual de enroscaloReact/imaginaloReact (mismo "plugin"):
  // en vez de cortar en cualquier letra, busca el límite de sílaba más
  // grande que entre en la fila, y recién ahí baja el resto a la
  // siguiente (nunca parte una sílaba al medio).
  const answerTileSize = 34;
  const charsPerRow = Math.max(6, Math.floor((Math.min(520, windowWidth) - 48 + 1.6) / (answerTileSize + 1.6)));
  const answerWord = TODAY_PUZZLE.answer;
  const maxChunkLength = Math.max(2, charsPerRow - 1);
  const answerBreakPoint =
    answerWord.length > charsPerRow
      ? (getSyllableBreakPoint(answerWord, maxChunkLength) ?? getRecommendedBreakPoint(answerWord.split(""), maxChunkLength))
      : null;
  const answerRow1 = answerBreakPoint !== null ? answerChars.slice(0, answerBreakPoint) : answerChars;
  const answerRow2 = answerBreakPoint !== null ? answerChars.slice(answerBreakPoint) : [];

  function renderAnswerTile(ch: string, key: number) {
    return (
      <Box
        key={key}
        onClick={() => setKeyboardOpen(true)}
        sx={{
          width: answerTileSize, height: answerTileSize, borderRadius: "6px",
          border: `2px solid ${ACCENT}`, backgroundColor: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, color: "#333",
          cursor: "pointer",
        }}
      >
        {ch}
      </Box>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: keyboardOpen ? 20 : 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ backgroundColor: "#fff", borderRadius: 4, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {stage === "play" && (
            <>
              <Typography sx={{ textAlign: "center", color: "#777", fontSize: 13 }}>
                Cada bandera encontrada es una letra de una pista. Encontrá todas antes de toparte
                con una bomba.
              </Typography>

              {isMobile && (
                // Una sola píldora partida al medio (no dos botones
                // separados) — el lado activo queda sólido en rojo, el
                // inactivo en gris clarito, con los mismos íconos que se
                // ven en la grilla (la bomba clásica para Revelar, la
                // banderita clásica para Bandera) en vez de los genéricos
                // de lupa/bandera de Material Icons.
                <Box
                  sx={{
                    display: "flex",
                    width: "fit-content",
                    mx: "auto",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setFlagMode(false)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.75,
                      border: "none", outline: "none", appearance: "none", cursor: "pointer",
                      px: 2.5, py: 1.1, fontWeight: 800, fontSize: 15, fontFamily: "inherit",
                      backgroundColor: flagMode ? "#eeeeee" : ACCENT,
                      color: flagMode ? "#888" : "#fff",
                    }}
                  >
                    <MineIcon sx={{ fontSize: 21 }} />
                    Revelar
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setFlagMode(true)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.75,
                      border: "none", outline: "none", appearance: "none", cursor: "pointer",
                      px: 2.5, py: 1.1, fontWeight: 800, fontSize: 15, fontFamily: "inherit",
                      backgroundColor: flagMode ? ACCENT : "#eeeeee",
                      color: flagMode ? "#fff" : "#888",
                    }}
                  >
                    Bandera
                    <ClassicFlagIcon sx={{ fontSize: 21 }} />
                  </Box>
                </Box>
              )}

              <Board
                grid={board.grid}
                interactive={board.phase === "playing"}
                flagMode={flagMode}
                onReveal={(r, c) => board.revealCell({ r, c })}
                onFlag={(r, c) => board.flagCell({ r, c })}
              />

              {board.phase === "solved" && (
                <Typography sx={{ textAlign: "center", color: "#2ecc71", fontWeight: 800 }}>
                  ¡Encontraste todas las letras!
                </Typography>
              )}
              {board.phase === "lost" && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: ACCENT, fontWeight: 800 }}>
                  <MineIcon sx={{ fontSize: 24 }} />
                  <Typography sx={{ color: "inherit", fontWeight: "inherit", textAlign: "center" }}>
                    ¡Pisaste una bomba!
                    <br />
                    Arriesgá con lo que encontraste.
                  </Typography>
                  <MineIcon sx={{ fontSize: 24 }} />
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {TODAY_PUZZLE.clueWords.map((word, i) => (
                  <Box
                    key={i}
                    sx={{
                      backgroundColor: "#fff5f5",
                      border: `1px solid ${ACCENT}`,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: 10, color: "#333" }}>Pista {i + 1}</Typography>
                    <DraggableLetters
                      letters={clueOrders[i]}
                      totalSlots={word.length}
                      onReorder={(next) => handleReorderClue(i, next)}
                    />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  backgroundColor: "#fff5f5",
                  border: `1px solid ${ACCENT}`,
                  borderRadius: 2,
                  p: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#333", textAlign: "center" }}>
                  ¿Cuál es la palabra final?
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    {answerRow1.map((ch, i) => renderAnswerTile(ch, i))}
                  </Box>
                  {answerRow2.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                      {answerRow2.map((ch, i) => renderAnswerTile(ch, answerRow1.length + i))}
                    </Box>
                  )}
                </Box>
              </Box>
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

        {stage === "play" && (
          <HowToPlayCollapse
            title="¿Cómo jugar?"
            body="Tocá una celda simple para revelarla: siempre es segura y te muestra un número (cuántas letras hay en sus vecinas) — si da 0, destapa en bloque sus vecinas. Pero si tocás directo una celda de letra sin marcarla antes, ¡es una bomba! En la grilla hay letras de las 4 pistas mezcladas. Para sumar una letra sin arriesgar, marcála con bandera en vez de tocarla: en computadora, click derecho; en el celular, activá el modo Bandera arriba del tablero. Cada letra que reclamás baja a la tarjeta de su pista — arrastralas para ordenarlas y descubrir la palabra. Usá las 4 pistas para adivinar la palabra final, abajo de todo."
          />
        )}
      </Box>

      {stage === "play" && (
        <VirtualKeyboard onKeyPress={handleKeyInput} open={keyboardOpen} onClose={() => setKeyboardOpen(false)} />
      )}
    </Layout>
  );
}
