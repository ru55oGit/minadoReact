import Box from "@mui/material/Box";
import ClassicFlagIcon from "../icons/ClassicFlagIcon";
import MineIcon from "../icons/MineIcon";
import { MinadoGrid } from "../../game/types";

// Réplicas del mástil/bandera y la mina clásicos del buscaminas de
// Windows (ver icons/ClassicFlagIcon.tsx y icons/MineIcon.tsx) — SVG, no
// emoji: en dispositivos/navegadores sin fuente de emoji a color, 🚩/💣
// caían a un glifo de reemplazo genérico, irreconocible (reporte real:
// "ponete las pilas", la bandera no se veía como tal). Un ícono SVG se ve
// igual en cualquier lado, sin depender de qué fuentes tenga instaladas
// el sistema.
const CELL_ICON_SX = { fontSize: { xs: 19, sm: 21 } } as const;

// Mismos colores que el buscaminas clásico para los números de celdas
// simples (cantidad de letras vecinas) — 0 no muestra nada.
const NUMBER_COLORS: Record<number, string> = {
  1: "#1565c0", 2: "#2e7d32", 3: "#c62828", 4: "#1a237e",
  5: "#6d4c41", 6: "#00838f", 7: "#000000", 8: "#616161",
};

// Mismo bisel 3D de Windows, pero con el rojo/blanco de la app en vez de
// la escala de grises original.
const BEVEL_LIGHT = "#ffffff";
const BEVEL_DARK = "#a83228";
const HIDDEN_BG = "#e74c3c";
const REVEALED_BG = "#ffffff";
const FOUND_BG = "#a6f184";
// Rojo bien saturado, claramente más brillante que el de las celdas
// ocultas, para que la celda que explotó salte a la vista de verdad
// (reporte real: "otro color de fondo, que contraste" — el amarillo
// anterior quedó pegado por error a esta celda en vez de acá).
const EXPLODED_BG = "#ff3c3c";

interface BoardProps {
  grid: MinadoGrid;
  interactive: boolean;
  flagMode: boolean;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
}

// Input: click/tap normal hace lo que indica `flagMode` (revelar o marcar
// con bandera — ver el toggle "Revelar/Bandera" en game.tsx, pensado para
// mobile). Click derecho (desktop) siempre marca con bandera, sin importar
// el modo activo — así el mouse se sigue comportando como el buscaminas
// original de siempre.
export default function Board({ grid, interactive, flagMode, onReveal, onFlag }: BoardProps) {
  const size = grid.length;

  function handleClick(r: number, c: number, isHidden: boolean) {
    if (!isHidden) return;
    if (flagMode) onFlag(r, c);
    else onReveal(r, c);
  }

  // PRUEBA VISUAL: look clásico Windows 9x, a ver si se queda o volvemos
  // al estilo anterior — panel 3D con bisel (claro arriba-izq, oscuro
  // abajo-der) para las celdas ocultas, y hundido (al revés) para las ya
  // reveladas, sin gap entre celdas (el bisel de cada una arma la
  // separación) y un marco grueso biselado alrededor de todo el tablero.
  return (
    <Box
      sx={{
        width: { xs: size * 26 + 16, sm: size * 28 + 16 },
        mx: "auto",
        p: "8px",
        backgroundColor: HIDDEN_BG,
        borderStyle: "solid",
        borderWidth: "4px",
        borderTopColor: BEVEL_LIGHT,
        borderLeftColor: BEVEL_LIGHT,
        borderRightColor: BEVEL_DARK,
        borderBottomColor: BEVEL_DARK,
      }}
    >
      <Box
        sx={{
          display: "grid",
          // minmax(0, 1fr), no solo "1fr": un track "1fr" sin el minmax
          // puede igual crecer por el contenido de UN ítem (su "automatic
          // minimum size"), aunque ese ítem tenga min-width:0 — el límite
          // real tiene que fijarse en el TRACK de la grilla, no solo en la
          // celda. Sin esto, una celda marcada con bandera (sin letra ni
          // bomba) podía seguir estirando toda su columna (reporte real:
          // "si pones una bandera donde no hay bomba, se sigue estirando
          // la celda").
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridAutoRows: "minmax(0, 1fr)",
          aspectRatio: "1 / 1",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isHidden = cell.state === "hidden";
            const isRevealed = cell.state === "revealed";
            const isFound = cell.state === "found";
            const isExploded = cell.state === "exploded";
            const showNumber = isRevealed && cell.adjacent && cell.adjacent > 0;
            const showHelperFlag = cell.flagged && isHidden;
            // Las celdas resueltas (reveladas, reclamadas o explotadas) se
            // ven "hundidas"; las que siguen ocultas, "en relieve" — igual
            // que el buscaminas de Windows de toda la vida.
            const isSunken = isRevealed || isFound || isExploded;

            // Solo el número necesita un color de texto explícito — la
            // bandera y la mina ahora son íconos con color propio fijo
            // (MineIcon/ClassicFlagIcon), no dependen de este "currentColor".
            const contentColor = showNumber ? NUMBER_COLORS[cell.adjacent as number] : "transparent";

            return (
              <Box
                key={`${r}-${c}`}
                component="button"
                type="button"
                disabled={!interactive}
                onContextMenu={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (isHidden) onFlag(r, c);
                }}
                onClick={() => handleClick(r, c, isHidden)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                  // Reset del <button> nativo: sin esto, algunos
                  // navegadores (WebKit sobre todo) le dan a los botones
                  // un tamaño mínimo propio según su contenido que ignora
                  // min-width, así que una celda con un glifo más ancho
                  // "estiraba" esa columna de la grilla entera (reporte
                  // real: "la banderita errónea, estira el cuadradito").
                  // width/height 100% + overflow hidden garantizan que la
                  // celda siempre ocupe exactamente su lugar en la grilla.
                  appearance: "none",
                  WebkitAppearance: "none",
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  p: 0,
                  minWidth: 0,
                  borderRadius: 0,
                  borderStyle: "solid",
                  borderWidth: isSunken ? "1px" : "2px",
                  borderTopColor: isSunken ? BEVEL_DARK : BEVEL_LIGHT,
                  borderLeftColor: isSunken ? BEVEL_DARK : BEVEL_LIGHT,
                  borderRightColor: isSunken ? BEVEL_LIGHT : BEVEL_DARK,
                  borderBottomColor: isSunken ? BEVEL_LIGHT : BEVEL_DARK,
                  fontWeight: 800,
                  fontSize: { xs: 10, sm: 12 },
                  fontFamily: "monospace",
                  cursor: isHidden && interactive ? "pointer" : "default",
                  color: contentColor,
                  backgroundColor: isExploded ? EXPLODED_BG : isFound ? FOUND_BG : isRevealed ? REVEALED_BG : HIDDEN_BG,
                }}
              >
                {/* La letra reclamada con bandera NO se muestra acá — solo
                    queda la banderita como confirmación; la letra real
                    aparece abajo, en la tarjeta de su pista (DraggableLetters). */}
                {isFound && <ClassicFlagIcon sx={CELL_ICON_SX} />}
                {isExploded && <MineIcon sx={CELL_ICON_SX} />}
                {showHelperFlag && <ClassicFlagIcon sx={CELL_ICON_SX} />}
                {showNumber && cell.adjacent}
              </Box>
            );
          }),
        )}
      </Box>
    </Box>
  );
}
