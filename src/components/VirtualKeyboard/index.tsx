import Box from "@mui/material/Box";
import KeyboardHideRoundedIcon from "@mui/icons-material/KeyboardHideRounded";
import { useIsMobile } from "../../hooks/useIsMobile";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  // Igual que en los otros juegos del hub: el teclado NO vive siempre
  // montado en la pantalla — es un overlay fijo abajo de todo que se abre
  // al tocar una casilla de respuesta y se cierra con su propio botón
  // (reporte real: "que funcione igual que los otros juegos, que se
  // levante y cierre como en los otros").
  open: boolean;
  onClose: () => void;
}

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

// Solo se muestra en mobile, igual que el original (desktop usa el
// teclado físico vía usePhysicalKeyboard, que no depende de este `open`).
export default function VirtualKeyboard({ onKeyPress, open, onClose }: VirtualKeyboardProps) {
  const isMobile = useIsMobile();
  if (!isMobile || !open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: "8px 4px 12px",
        zIndex: 9999,
        borderTop: "1px solid #555",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
          <Box
            component="button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar teclado"
            sx={{ ...keyButtonSx, flex: 1.5, backgroundColor: "#e74c3c", borderColor: "#c0392b" }}
          >
            <KeyboardHideRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
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
    </Box>
  );
}
