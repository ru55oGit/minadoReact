import Box from "@mui/material/Box";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import BombIcon from "../icons/BombIcon";
import { MinadoGrid } from "../../game/types";

// Íconos de verdad (SVG), no emoji: en dispositivos/navegadores sin
// fuente de emoji a color, 🚩/💣 caían a un glifo de reemplazo genérico
// (un simple triángulo rojo, irreconocible como bandera o bomba — reporte
// real: "ponete las pilas", la bandera no se veía como tal). Un ícono SVG
// se ve igual en cualquier lado, sin depender de qué fuentes tenga
// instaladas el sistema.
const CELL_ICON_SX = { fontSize: { xs: 15, sm: 17 } } as const;

// Mismos colores que el buscaminas clásico para los números de celdas
// simples (cantidad de letras vecinas) — 0 no muestra nada.
const NUMBER_COLORS: Record<number, string> = {
  1: "#1565c0", 2: "#2e7d32", 3: "#c62828", 4: "#1a237e",
  5: "#6d4c41", 6: "#00838f", 7: "#000000", 8: "#616161",
};

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

  return (
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
        gap: "2px",
        width: { xs: size * 26, sm: size * 28 },
        aspectRatio: "1 / 1",
        mx: "auto",
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

          // Color de texto explícito para TODO lo que no sea una celda
          // vacía — no alcanza con dejarlo en "transparent" salvo en el
          // caso del número: si el emoji de bandera/bomba no tiene fuente
          // de color disponible (pasa en algunos navegadores/dispositivos
          // sin emojis a color instalados), el navegador lo dibuja como un
          // glifo monocromo que SÍ hereda el color de texto — con
          // "transparent" quedaba invisible aunque se estaba renderizando
          // (reporte real: "no veo lo que te pedí", la banderita y la
          // bomba no se veían en la grilla).
          let contentColor = "transparent";
          if (showNumber) contentColor = NUMBER_COLORS[cell.adjacent as number];
          else if (isFound || isExploded) contentColor = "#ffffff";
          else if (showHelperFlag) contentColor = "#b71c1c";

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
                border: "none",
                outline: "none",
                // Reset del <button> nativo: sin esto, algunos navegadores
                // (WebKit sobre todo) le dan a los botones un tamaño
                // mínimo propio según su contenido que ignora min-width,
                // así que una celda con un glifo más ancho (la bandera,
                // cuando el dispositivo no tiene emoji a color y cae a un
                // glifo de reemplazo) "estiraba" esa columna de la grilla
                // entera (reporte real: "la banderita errónea, estira el
                // cuadradito"). width/height 100% + overflow hidden
                // garantizan que la celda siempre ocupe exactamente su
                // lugar en la grilla, recorte lo que recorte el contenido.
                appearance: "none",
                WebkitAppearance: "none",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
                p: 0,
                minWidth: 0,
                borderRadius: "4px",
                fontWeight: 800,
                fontSize: { xs: 10, sm: 12 },
                fontFamily: "monospace",
                cursor: isHidden && interactive ? "pointer" : "default",
                color: contentColor,
                // Oculta vs. revelada tienen que distinguirse de un
                // vistazo — antes eran casi el mismo gris clarito
                // (#f3f3f3 vs #fafafa) y no se notaba qué ya se había
                // destapado (reporte real: "más contraste").
                backgroundColor: isExploded ? "#e74c3c" : isFound ? "#22c55e" : isRevealed ? "#ffffff" : "#c7c7c7",
                boxShadow: isRevealed ? "inset 0 0 0 1px #e0e0e0" : "none",
              }}
            >
              {/* La letra reclamada con bandera NO se muestra acá — solo
                  queda la banderita como confirmación; la letra real
                  aparece abajo, en la lista de encontradas (LetterSlots). */}
              {isFound && <FlagRoundedIcon sx={CELL_ICON_SX} />}
              {isExploded && <BombIcon sx={CELL_ICON_SX} />}
              {showHelperFlag && <FlagRoundedIcon sx={CELL_ICON_SX} />}
              {showNumber && cell.adjacent}
            </Box>
          );
        }),
      )}
    </Box>
  );
}
