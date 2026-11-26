import { useRef, useState } from "react";
import Box from "@mui/material/Box";

// Mismo estilo que las casillas de letra de enroscaloReact/imaginaloReact
// (fondo blanco, borde azul marino, sombrita) en vez del propio
// azul/rosado — pedido explícito: "copia los estilos de las cards de las
// letras de los otros juegos".
const BORDER = "#1f2f64";
const FILL = "#ffffff";
const TILE = 28;
const GAP = 5;

interface DraggableLettersProps {
  // Letras ya encontradas de ESTA pista, en el orden que el jugador eligió
  // verlas (arranca en orden de descubrimiento, pero se puede reordenar
  // arrastrando — ayuda a "leer" la palabra aunque se hayan encontrado
  // salteadas).
  letters: string[];
  totalSlots: number;
  onReorder: (next: string[]) => void;
}

// Arrastre con Pointer Events (no HTML5 drag-and-drop nativo: en touch no
// dispara de forma confiable) — al mover el dedo/mouse calcula cuántos
// lugares se corrió según el ancho de una celda, y si cruzó a la celda
// vecina, intercambia posiciones en el momento (drag en vivo, no recién
// al soltar).
export default function DraggableLetters({ letters, totalSlots, onReorder }: DraggableLettersProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const startXRef = useRef(0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, index: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIndex(index);
    startXRef.current = e.clientX;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>, index: number) {
    if (dragIndex !== index) return;
    const deltaX = e.clientX - startXRef.current;
    const step = TILE + GAP;
    const shift = Math.round(deltaX / step);
    if (shift === 0) return;
    const to = Math.min(Math.max(index + shift, 0), letters.length - 1);
    if (to === index) return;
    const next = letters.slice();
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setDragIndex(to);
    startXRef.current = e.clientX;
  }

  function handlePointerUp() {
    setDragIndex(null);
  }

  return (
    <Box sx={{ display: "flex", gap: `${GAP}px`, justifyContent: "center", flexWrap: "wrap" }}>
      {letters.map((letter, i) => (
        <Box
          key={i}
          onPointerDown={(e) => handlePointerDown(e, i)}
          onPointerMove={(e) => handlePointerMove(e, i)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            width: TILE,
            height: TILE,
            borderRadius: 1,
            border: `2px solid ${BORDER}`,
            backgroundColor: dragIndex === i ? "#eef1fb" : FILL,
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pb: "2px",
            fontWeight: 800,
            fontSize: 14,
            color: "#111827",
            touchAction: "none",
            userSelect: "none",
            cursor: letters.length > 1 ? "grab" : "default",
            transform: dragIndex === i ? "scale(1.1)" : "none",
            transition: dragIndex === i ? "none" : "transform 0.15s ease",
            position: "relative",
            zIndex: dragIndex === i ? 2 : 1,
          }}
        >
          {letter}
        </Box>
      ))}
      {Array.from({ length: Math.max(0, totalSlots - letters.length) }, (_, i) => (
        <Box
          key={`empty-${i}`}
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
          _
        </Box>
      ))}
    </Box>
  );
}
