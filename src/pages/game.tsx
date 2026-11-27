import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Layout from "../components/Layout";
import Board from "../components/Board";
import MinesweeperHeader from "../components/MinesweeperHeader";
import MineIcon from "../components/icons/MineIcon";
import ClassicFlagIcon from "../components/icons/ClassicFlagIcon";
import ClueLetterSlots from "../components/ClueLetterSlots";
import VirtualKeyboard from "../components/VirtualKeyboard";
import HowToPlayCollapse from "../components/HowToPlayCollapse";
import { useMinadoBoard } from "../hooks/useMinadoBoard";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useIsMobile } from "../hooks/useIsMobile";
import { useLanguage } from "../i18n/LanguageContext";
import { GRID_SIZE } from "../game/grid";
import {
  getTodayBonusPuzzle,
  getGameNumber,
  getCurrentDayKey,
  isDayKey,
  isDayAvailable,
  getPuzzleForDayKey,
  dateKeyForDayKey,
} from "../data/dailyPuzzles";
import { getDayProgress, saveDayProgress, scopeKeyFor, bonusScopeKey, isBonusUnlocked } from "../utils/minadoProgress";
import { buildShareText } from "../utils/shareText";
import { getRecommendedBreakPoint, getSyllableBreakPoint } from "../utils/syllableBreak";
import { BEVEL_LIGHT, BEVEL_DARK, HIDDEN_BG } from "../components/boardTheme";

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

function normalize(word: string): string {
  return word.trim().toUpperCase();
}

type Stage = "play" | "done";

export default function Game() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t, currentLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  // "Uno por día", mismo esquema de ruta que enroscaloReact
  // (/game?day=<clave>|bonus, sin parámetro = hoy). Un día que no sea
  // "bonus" ni una clave válida de la semana cae a hoy; un día de la
  // semana actual que todavía no llegó (no se puede jugar por
  // adelantado) también cae a hoy.
  const dayParam = searchParams.get("day");
  const isBonus = dayParam === "bonus";
  const requestedDayKey = isDayKey(dayParam) ? dayParam : getCurrentDayKey();
  const dayKey = isBonus ? getCurrentDayKey() : isDayAvailable(requestedDayKey) ? requestedDayKey : getCurrentDayKey();
  const puzzle = useMemo(
    () => (isBonus ? getTodayBonusPuzzle(new Date(), currentLanguage) : getPuzzleForDayKey(dayKey, new Date(), currentLanguage)),
    [isBonus, dayKey, currentLanguage],
  );
  const combinedWord = useMemo(() => puzzle.clueWords.join(""), [puzzle]);
  const clueRanges = useMemo(() => buildClueRanges(puzzle.clueWords), [puzzle]);
  const gameNumber = useMemo(() => getGameNumber(), []);
  // Clave de guardado por día calendario real (no por día de la semana) y
  // por idioma: cada ocurrencia de "lunes" en semanas distintas, o en un
  // idioma distinto, es su propio día.
  const scopeKey = useMemo(
    () => (isBonus ? bonusScopeKey(currentLanguage, dateKeyForDayKey(dayKey)) : scopeKeyFor(currentLanguage, dateKeyForDayKey(dayKey))),
    [isBonus, dayKey, currentLanguage],
  );

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

  const board = useMinadoBoard(combinedWord, GRID_SIZE + 1);

  // Popup de "jugar de nuevo" — perder (las 3 vidas, ver useMinadoBoard)
  // pide ver un anuncio antes de reiniciar (patrón de recompensa ya
  // usado en el resto del hub).
  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  function resetGame() {
    board.reset();
    setClueOrders(emptyClueOrders());
    setAnswerChars(Array.from({ length: puzzle.answer.length }, () => ""));
    setKeyboardOpen(false);
  }

  // Si el día activo cambia (otro día de la semana, bonus, otro idioma,
  // etc. vía el query param de la URL o el selector de idioma) sincroniza
  // todo con ESE día: si ya se jugó (persistido en localStorage), salta
  // derecho al resultado guardado en vez de dejar jugar de nuevo — "uno
  // por día" de verdad, igual que Wordle. El tablero ya se reinicia solo
  // al cambiar `combinedWord` (ver useMinadoBoard).
  useEffect(() => {
    const progress = getDayProgress(scopeKey);
    if (progress.status === "completed") {
      setFinalCorrect(progress.correct);
      setStage("done");
      return;
    }
    setClueOrders(puzzle.clueWords.map((word) => Array.from({ length: word.length }, () => "")));
    setAnswerChars(Array.from({ length: puzzle.answer.length }, () => ""));
    setKeyboardOpen(false);
    setFinalCorrect(null);
    setStage("play");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey]);

  function handleSmileyClick() {
    if (board.phase === "lost") {
      setRewardModalOpen(true);
      return;
    }
    resetGame();
  }

  function handleWatchRewarded() {
    // TODO: enganchar acá el SDK de ads real (useRewardedAd, como en el
    // resto del hub) cuando Minado se sume al sistema de ads — por ahora
    // el "premio" es inmediato.
    setRewardModalOpen(false);
    resetGame();
  }

  // Letras encontradas de cada pista, cada una YA en la posición que le
  // corresponde dentro de la palabra (no en orden de descubrimiento) —
  // con las 4 pistas compartiendo una sola grilla es mucho más difícil
  // completar una pista entera, así que no tenía sentido pedirle al
  // jugador que además las reordene a mano para leerlas.
  function emptyClueOrders(): string[][] {
    return puzzle.clueWords.map((word) => Array.from({ length: word.length }, () => ""));
  }

  const [clueOrders, setClueOrders] = useState<string[][]>(emptyClueOrders);

  useEffect(() => {
    setClueOrders(() =>
      clueRanges.map((range, i) => {
        const slots = Array.from({ length: range.length }, () => "");
        board.foundLetters.forEach((f) => {
          if (f.sourceIndex >= range.start && f.sourceIndex < range.start + range.length) {
            slots[f.sourceIndex - range.start] = f.letter;
          }
        });
        return slots;
      }),
    );
  }, [board.foundLetters]);

  // --- Respuesta tipeada (la palabra final, la única que se "confirma"
  // ahora) — mismo patrón que enroscaloReact: casillas + teclado
  // físico/virtual, con la misma protección contra el bug de Enter (un
  // array de largo equivocado, de una respuesta anterior, se ignora en
  // vez de confirmarse solo). ---
  const [answerChars, setAnswerChars] = useState<string[]>(() => Array.from({ length: puzzle.answer.length }, () => ""));

  const commitFinalAnswer = useCallback(
    (chars: string[]) => {
      if (chars.length !== puzzle.answer.length) return;
      if (chars.some((ch) => ch.length === 0)) return;
      const correct = normalize(chars.join("")) === normalize(puzzle.answer);
      saveDayProgress(scopeKey, correct);
      setFinalCorrect(correct);
      setKeyboardOpen(false);
      setStage("done");
    },
    [puzzle, scopeKey],
  );

  // La Ñ solo tiene sentido en español — en/pt (en esta versión, sin
  // tildes) usan A-Z nomás.
  const letterPattern = useMemo(() => (currentLanguage === "es" ? /^[A-ZÑ]$/ : /^[A-Z]$/), [currentLanguage]);

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
      if (!letterPattern.test(key)) return;

      setAnswerChars((prev) => {
        const fillIndex = prev.findIndex((ch) => !ch);
        if (fillIndex < 0) return prev;
        const next = [...prev];
        next[fillIndex] = key;
        if (next.every((ch) => ch.length > 0)) commitFinalAnswer(next);
        return next;
      });
    },
    [stage, answerChars, commitFinalAnswer, letterPattern],
  );

  usePhysicalKeyboard({ onKeyPress: handleKeyInput, enabled: stage === "play" });

  function handleCopyShare() {
    const text = buildShareText([board.grid], finalCorrect === true, isBonus ? undefined : gameNumber);
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
  const answerWord = puzzle.answer;
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
                {t.riskHint}
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
                    {t.revealLabel}
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
                    {t.flagLabel}
                    <ClassicFlagIcon sx={{ fontSize: 21 }} />
                  </Box>
                </Box>
              )}

              {/* Header + grilla comparten un solo marco biselado rojo/
                  blanco (no dos bloques separados) — pedido real: "unido
                  a la grilla tb". */}
              <Box
                sx={{
                  backgroundColor: HIDDEN_BG,
                  borderStyle: "solid",
                  borderWidth: "4px",
                  borderTopColor: BEVEL_LIGHT,
                  borderLeftColor: BEVEL_LIGHT,
                  borderRightColor: BEVEL_DARK,
                  borderBottomColor: BEVEL_DARK,
                  p: "8px",
                }}
              >
                <MinesweeperHeader
                  pendingLetters={combinedWord.length - board.foundLetters.length}
                  lives={board.lives}
                  phase={board.phase}
                  onSmileyClick={handleSmileyClick}
                />

                <Box sx={{ height: "8px" }} />

                <Board
                  grid={board.grid}
                  interactive={board.phase === "playing"}
                  flagMode={flagMode}
                  onReveal={(r, c) => board.revealCell({ r, c })}
                  onFlag={(r, c) => board.flagCell({ r, c })}
                />
              </Box>

              {board.phase === "solved" && (
                <Typography sx={{ textAlign: "center", color: "#2ecc71", fontWeight: 800 }}>
                  {t.allLettersFound}
                </Typography>
              )}
              {board.phase === "lost" && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: ACCENT, fontWeight: 800 }}>
                  <MineIcon sx={{ fontSize: 24 }} />
                  <Typography sx={{ color: "inherit", fontWeight: "inherit", textAlign: "center" }}>
                    {t.outOfLives}
                    <br />
                    {t.riskWithWhatYouFound}
                  </Typography>
                  <MineIcon sx={{ fontSize: 24 }} />
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {puzzle.clueWords.map((_, i) => (
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
                    <Typography sx={{ fontWeight: 800, fontSize: 10, color: "#333" }}>{t.clueLabel(i + 1)}</Typography>
                    <ClueLetterSlots letters={clueOrders[i]} />
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
                  {t.finalWordQuestion}
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
                {finalCorrect ? t.correctLabel : t.wasLabel(puzzle.answer)}
              </Typography>
              <Button onClick={handleCopyShare} variant="contained" sx={{ backgroundColor: "#333", fontWeight: 800, borderRadius: 999, py: 1.2 }}>
                {copied ? t.copiedLabel : t.shareButton}
              </Button>

              {/* Aviso hacia el set bonus — solo si no estás ya jugando
                  uno, y solo si ya está desbloqueado (jugaste todos los
                  días disponibles de la semana): pedido real: "si la
                  gente se copa, acuda mediante un aviso a los juegos
                  bonus". */}
              {!isBonus && isBonusUnlocked(currentLanguage) && (
                <Box
                  sx={{
                    backgroundColor: "#fff5f5",
                    border: `1px dashed ${ACCENT}`,
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: "#333", textAlign: "center", fontSize: 14 }}>
                    {t.bonusInviteTitle}
                  </Typography>
                  <Button
                    onClick={() => navigate("/game?day=bonus")}
                    variant="outlined"
                    sx={{ borderColor: ACCENT, color: ACCENT, fontWeight: 800, borderRadius: 999 }}
                  >
                    {t.bonusInviteButton}
                  </Button>
                </Box>
              )}

              <Button onClick={() => navigate("/")} sx={{ color: "#777", fontWeight: 700 }}>
                {t.backHome}
              </Button>
            </>
          )}
        </Box>

        {stage === "play" && (
          <HowToPlayCollapse title={t.howToPlayTitle} body={t.howToPlayBodyGame} />
        )}
      </Box>

      {stage === "play" && (
        <VirtualKeyboard onKeyPress={handleKeyInput} open={keyboardOpen} onClose={() => setKeyboardOpen(false)} />
      )}

      <Dialog open={rewardModalOpen} onClose={() => setRewardModalOpen(false)}>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, maxWidth: 320 }}>
          <MineIcon sx={{ fontSize: 32 }} />
          <Typography sx={{ fontWeight: 800, textAlign: "center", color: "#333" }}>
            {t.rewardModalText}
          </Typography>
          <Button
            onClick={handleWatchRewarded}
            variant="contained"
            sx={{ backgroundColor: ACCENT, fontWeight: 800, borderRadius: 999, px: 3, py: 1.2, "&:hover": { backgroundColor: "#c0392b" } }}
          >
            {t.rewardModalButton}
          </Button>
        </Box>
      </Dialog>
    </Layout>
  );
}
