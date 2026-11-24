import Box from "@mui/material/Box";
import { useIsMobile } from "../../hooks/useIsMobile";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

// Versión simplificada del teclado de enroscaloReact: mismas 3 filas
// QWERTY + el borrar dentro de la fila Z-M (rojo) — sin las filas de
// acentos (Minado por ahora es un solo idioma) ni Pasapalabra (vive como
// botón aparte en game.tsx, visible en mobile y desktop por igual). Solo
// se muestra en mobile, igual que el original (desktop usa el teclado
// físico vía usePhysicalKeyboard).
const ROW_1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW_2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"];
const ROW_3 = ["Z", "X", "C", "V", "B", "N", "M"];

const keyButtonSx = {
  flex: 1,
  minWidth: 0,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  border: "1px solid #666",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  backgroundColor: "#444",
  color: "#fff",
  transition: "all 0.15s ease",
  "&:active": { transform: "scale(0.96)" },
} as const;

export default function VirtualKeyboard({ onKeyPress }: VirtualKeyboardProps) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", gap: "2px" }}>
        {ROW_1.map((letter) => (
          <Box key={letter} component="button" type="button" onClick={() => onKeyPress(letter)} sx={keyButtonSx}>
            {letter}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: "2px" }}>
        {ROW_2.map((letter) => (
          <Box key={letter} component="button" type="button" onClick={() => onKeyPress(letter)} sx={keyButtonSx}>
            {letter}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: "2px" }}>
        {ROW_3.map((letter) => (
          <Box key={letter} component="button" type="button" onClick={() => onKeyPress(letter)} sx={keyButtonSx}>
            {letter}
          </Box>
        ))}
        <Box
          component="button"
          type="button"
          onClick={() => onKeyPress("{bksp}")}
          aria-label="Borrar"
          sx={{ ...keyButtonSx, flex: 1.5, backgroundColor: "#e74c3c", borderColor: "#c0392b" }}
        >
          ⌫
        </Box>
      </Box>
    </Box>
  );
}
