import Box from "@mui/material/Box";

const BORDER = "#1e2a4a";
const FILL = "#fbe4e4";

interface LetterSlotsProps {
  // Letras ya encontradas, EN EL ORDEN EN QUE SE DESCUBRIERON (no el orden
  // real de la palabra) — mismo criterio pedido: "en el orden en que lo
  // hayan encontrado".
  found: string[];
  totalSlots: number;
}

// Tira de casilleros estilo la referencia que pasó el usuario: borde azul
// marino, fondo rosado pálido, un guión bajo cuando está vacío; la letra
// grande cuando ya se encontró esa posición.
export default function LetterSlots({ found, totalSlots }: LetterSlotsProps) {
  return (
    <Box sx={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: totalSlots }, (_, i) => {
        const letter = found[i];
        return (
          <Box
            key={i}
            sx={{
              width: 42,
              height: 42,
              borderRadius: "8px",
              border: `2px solid ${BORDER}`,
              backgroundColor: FILL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              color: BORDER,
              fontFamily: "Nunito, sans-serif",
            }}
          >
            {letter ?? "_"}
          </Box>
        );
      })}
    </Box>
  );
}
