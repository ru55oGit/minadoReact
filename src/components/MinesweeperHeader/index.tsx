import Box from "@mui/material/Box";
import SmileyIcon, { SmileyMood } from "../icons/SmileyIcon";
import { BoardPhase } from "../../hooks/useMinadoBoard";
import { BEVEL_LIGHT, BEVEL_DARK, HIDDEN_BG } from "../boardTheme";
import { useLanguage } from "../../i18n/LanguageContext";

interface MinesweeperHeaderProps {
  // Letras de las 4 pistas que todavía no se reclamaron con bandera —
  // "la cantidad de minas a encontrar", que decrece a medida que las vas
  // marcando (igual que el contador clásico, acá cuenta letras en vez de
  // minas).
  pendingLetters: number;
  seconds: number;
  phase: BoardPhase;
  onSmileyClick: () => void;
}

// Pantallita estilo reloj digital/LED de siete segmentos (rojo sobre
// negro), 3 dígitos con cero a la izquierda — igual que el contador y el
// cronómetro del buscaminas de Windows. Esta sí se queda en gris/negro
// (es una "pantalla" aparte, no parte del marco biselado rojo/blanco).
function LedDigits({ value }: { value: number }) {
  const text = String(Math.max(0, Math.min(999, value))).padStart(3, "0");
  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#200000",
        border: "2px solid",
        borderTopColor: "#7b7b7b",
        borderLeftColor: "#7b7b7b",
        borderRightColor: "#ffffff",
        borderBottomColor: "#ffffff",
        px: "3px",
      }}
    >
      {text.split("").map((digit, i) => (
        <Box
          key={i}
          sx={{
            width: { xs: 14, sm: 16 },
            textAlign: "center",
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: { xs: 20, sm: 24 },
            lineHeight: { xs: "26px", sm: "30px" },
            color: "#ff3b3b",
          }}
        >
          {digit}
        </Box>
      ))}
    </Box>
  );
}

// Sin marco propio: este header vive DENTRO del mismo panel biselado que
// la grilla (ver game.tsx), para que se vean como un solo marco continuo
// en vez de dos bloques separados (reporte real: "unido a la grilla
// tb"). El botón de la carita sí usa el mismo rojo/blanco del resto de
// la app en vez del gris clásico ("con el mismo color que la grilla").
export default function MinesweeperHeader({ pendingLetters, seconds, phase, onSmileyClick }: MinesweeperHeaderProps) {
  const { t } = useLanguage();
  const mood: SmileyMood = phase === "lost" ? "sad" : phase === "solved" ? "cool" : "happy";

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <LedDigits value={pendingLetters} />
      <Box
        component="button"
        type="button"
        onClick={onSmileyClick}
        aria-label={t.ariaPlayAgain}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: 34, sm: 38 },
          height: { xs: 34, sm: 38 },
          p: 0,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none",
          cursor: "pointer",
          backgroundColor: HIDDEN_BG,
          borderStyle: "solid",
          borderWidth: "2px",
          borderTopColor: BEVEL_LIGHT,
          borderLeftColor: BEVEL_LIGHT,
          borderRightColor: BEVEL_DARK,
          borderBottomColor: BEVEL_DARK,
        }}
      >
        <SmileyIcon mood={mood} sx={{ fontSize: { xs: 26, sm: 30 } }} />
      </Box>
      <LedDigits value={seconds} />
    </Box>
  );
}
