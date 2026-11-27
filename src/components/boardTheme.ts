// Colores compartidos entre Board y MinesweeperHeader — mismo bisel 3D de
// Windows, pero en rojo/blanco (los de la app) en vez de la escala de
// grises original. Centralizado acá para que el header y la grilla usen
// EXACTAMENTE los mismos tonos y se vean como un solo marco continuo.
export const BEVEL_LIGHT = "#ffffff";
export const BEVEL_DARK = "#a83228";
export const HIDDEN_BG = "#e74c3c";
export const REVEALED_BG = "#ffffff";
export const FOUND_BG = "#a6f184";
// Rojo bien saturado, claramente más brillante que el de las celdas
// ocultas, para que la celda que explotó salte a la vista de verdad.
export const EXPLODED_BG = "#ff3c3c";

// Mismos colores que el buscaminas clásico para los números de celdas
// simples (cantidad de letras vecinas) — compartido con la vidriera
// estática de la Home, para que se vea igual que el tablero real.
export const NUMBER_COLORS: Record<number, string> = {
  1: "#1565c0", 2: "#2e7d32", 3: "#c62828", 4: "#1a237e",
  5: "#6d4c41", 6: "#00838f", 7: "#000000", 8: "#616161",
};
