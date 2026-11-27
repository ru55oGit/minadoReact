import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ClassicFlagIcon from "../icons/ClassicFlagIcon";
import { BEVEL_LIGHT, BEVEL_DARK, HIDDEN_BG, REVEALED_BG, FOUND_BG, NUMBER_COLORS } from "../boardTheme";

// Vidriera animada de la Home: un tablero 5x5 chico con el MISMO look
// final del juego real (bisel clásico rojo/blanco, íconos propios) que
// se "juega solo" en loop — revela números y banderas de a poco, y a
// medida que avanza va completando dos palabras-pista de ejemplo abajo
// (pedido real: "reemplazalo esa grilla vieja por una final... hace una
// animación que juego al buscaminas, y revele las 3 letras que faltan en
// las cards").
const GRID = 5;

const CARD1_WORD = "FORMAS";
const CARD1_BLANKS = [0, 5];
const CARD2_WORD = "PALABRAS";
const CARD2_BLANKS = [0];

// 3 pasos de revelado en total (2 blancos de la card 1 + 1 de la card 2)
// — el orden intercala las dos cards para que se vea que "van avanzando
// juntas".
const REVEAL_ORDER: Array<{ card: 1 | 2 }> = [{ card: 1 }, { card: 2 }, { card: 1 }];

interface Frame {
  numbers: Array<{ r: number; c: number; n: number }>;
  flags: Array<{ r: number; c: number }>;
  lettersRevealed: number;
  holdMs: number;
}

const FRAMES: Frame[] = [
  { numbers: [], flags: [], lettersRevealed: 0, holdMs: 900 },
  { numbers: [{ r: 0, c: 3, n: 2 }], flags: [], lettersRevealed: 0, holdMs: 700 },
  { numbers: [{ r: 0, c: 3, n: 2 }, { r: 2, c: 0, n: 1 }], flags: [{ r: 1, c: 1 }], lettersRevealed: 1, holdMs: 900 },
  { numbers: [{ r: 0, c: 3, n: 2 }, { r: 2, c: 0, n: 1 }, { r: 3, c: 4, n: 1 }], flags: [{ r: 1, c: 1 }], lettersRevealed: 1, holdMs: 600 },
  { numbers: [{ r: 0, c: 3, n: 2 }, { r: 2, c: 0, n: 1 }, { r: 3, c: 4, n: 1 }], flags: [{ r: 1, c: 1 }, { r: 3, c: 2 }], lettersRevealed: 2, holdMs: 900 },
  { numbers: [{ r: 0, c: 3, n: 2 }, { r: 2, c: 0, n: 1 }, { r: 3, c: 4, n: 1 }, { r: 1, c: 4, n: 1 }], flags: [{ r: 1, c: 1 }, { r: 3, c: 2 }], lettersRevealed: 2, holdMs: 600 },
  { numbers: [{ r: 0, c: 3, n: 2 }, { r: 2, c: 0, n: 1 }, { r: 3, c: 4, n: 1 }, { r: 1, c: 4, n: 1 }], flags: [{ r: 1, c: 1 }, { r: 3, c: 2 }, { r: 4, c: 0 }], lettersRevealed: 3, holdMs: 2400 },
];

function revealedBlanksForCard(card: 1 | 2, lettersRevealed: number): number {
  return REVEAL_ORDER.slice(0, lettersRevealed).filter((step) => step.card === card).length;
}

function buildCardDisplay(word: string, blanks: number[], revealedBlanks: number): string {
  const stillBlank = new Set(blanks.slice(revealedBlanks));
  return word
    .split("")
    .map((ch, i) => (stillBlank.has(i) ? "_" : ch))
    .join("");
}

function CardPreview({ text }: { text: string }) {
  return (
    <Box sx={{ display: "flex", gap: "4px", justifyContent: "center" }}>
      {text.split("").map((ch, i) => (
        <Box
          key={i}
          sx={{
            width: 22, height: 26, borderRadius: "4px",
            border: "2px solid #1f2f64", backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "#111827",
          }}
        >
          {ch === "_" ? "" : ch}
        </Box>
      ))}
    </Box>
  );
}

export default function HomePreviewBoard() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
  }, []);

  useEffect(() => {
    // Con reduced-motion, se queda quieto en el cuadro final (ya
    // completo), en vez de animar en loop sin parar.
    if (reducedMotion) {
      setFrameIndex(FRAMES.length - 1);
      return;
    }
    const frame = FRAMES[frameIndex];
    const id = setTimeout(() => {
      setFrameIndex((i) => (i + 1) % FRAMES.length);
    }, frame.holdMs);
    return () => clearTimeout(id);
  }, [frameIndex, reducedMotion]);

  const frame = FRAMES[frameIndex];
  const numberAt = new Map(frame.numbers.map((n) => [`${n.r}-${n.c}`, n.n]));
  const flagAt = new Set(frame.flags.map((f) => `${f.r}-${f.c}`));

  const card1Text = buildCardDisplay(CARD1_WORD, CARD1_BLANKS, revealedBlanksForCard(1, frame.lettersRevealed));
  const card2Text = buildCardDisplay(CARD2_WORD, CARD2_BLANKS, revealedBlanksForCard(2, frame.lettersRevealed));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          backgroundColor: HIDDEN_BG,
          borderStyle: "solid",
          borderWidth: "4px",
          borderTopColor: BEVEL_LIGHT,
          borderLeftColor: BEVEL_LIGHT,
          borderRightColor: BEVEL_DARK,
          borderBottomColor: BEVEL_DARK,
          p: "6px",
          width: "100%",
          maxWidth: 220,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`,
            gridAutoRows: "minmax(0, 1fr)",
            aspectRatio: "1 / 1",
          }}
        >
          {Array.from({ length: GRID }, (_, r) =>
            Array.from({ length: GRID }, (_, c) => {
              const key = `${r}-${c}`;
              const number = numberAt.get(key);
              const isFlag = flagAt.has(key);
              const isRevealed = number !== undefined;
              const isSunken = isRevealed || isFlag;
              return (
                <Box
                  key={key}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    // width/height 100% + boxSizing:border-box: sin esto,
                    // el borde entra a sumar al tamaño total de la celda
                    // (content-box) en vez de quedar adentro, y como el
                    // borde cambia de grosor entre oculta (2px) y
                    // revelada (1px), la celda "saltaba" de tamaño al
                    // cambiar de estado — mismo bug ya resuelto en el
                    // tablero real (Board/index.tsx), acá se me había
                    // escapado.
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    borderStyle: "solid",
                    borderWidth: isSunken ? "1px" : "2px",
                    borderTopColor: isSunken ? BEVEL_DARK : BEVEL_LIGHT,
                    borderLeftColor: isSunken ? BEVEL_DARK : BEVEL_LIGHT,
                    borderRightColor: isSunken ? BEVEL_LIGHT : BEVEL_DARK,
                    borderBottomColor: isSunken ? BEVEL_LIGHT : BEVEL_DARK,
                    backgroundColor: isFlag ? FOUND_BG : isRevealed ? REVEALED_BG : HIDDEN_BG,
                    fontWeight: 800,
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: number ? NUMBER_COLORS[number] : "transparent",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {isFlag && <ClassicFlagIcon sx={{ fontSize: 15 }} />}
                  {isRevealed && !isFlag && number}
                </Box>
              );
            }),
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, alignItems: "center" }}>
        <CardPreview text={card1Text} />
        <CardPreview text={card2Text} />
      </Box>
    </Box>
  );
}
