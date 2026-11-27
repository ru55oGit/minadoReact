import Box from "@mui/material/Box";

// Mismo estilo que las casillas de letra de enroscaloReact/imaginaloReact
// (fondo blanco, borde azul marino, sombrita).
const BORDER = "#1f2f64";
const FILL = "#ffffff";
const TILE = 28;
const GAP = 5;

interface ClueLetterSlotsProps {
  // Una celda por letra de la palabra, YA en su posición correcta — "_"
  // (string vacío) en las que todavía no se encontraron. Con las 4 pistas
  // compartiendo una sola grilla es más difícil completar una pista
  // entera, así que ya no alcanza con mostrarlas en orden de
  // descubrimiento (habría que reordenarlas a mano): cada letra
  // reclamada aparece directo en el lugar que le corresponde dentro de
  // la palabra.
  letters: string[];
}

export default function ClueLetterSlots({ letters }: ClueLetterSlotsProps) {
  return (
    <Box sx={{ display: "flex", gap: `${GAP}px`, justifyContent: "center", flexWrap: "wrap" }}>
      {letters.map((letter, i) => (
        <Box
          key={i}
          sx={{
            width: TILE,
            height: TILE,
            borderRadius: 1,
            border: `2px solid ${BORDER}`,
            backgroundColor: FILL,
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pb: "2px",
            fontWeight: 800,
            fontSize: 14,
            color: "#111827",
          }}
        >
          {letter || "_"}
        </Box>
      ))}
    </Box>
  );
}
