import { Cell, MinadoGrid } from "../game/types";

// Spoiler-safe: la letra real nunca aparece en el texto para compartir —
// solo si esa celda se reclamó con bandera (✅), explotó por tocarla
// directo (💣), ya se destapó por ser simple (⬜) o todavía seguía oculta
// cuando se pasó a adivinar (⬛).
function cellEmoji(cell: Cell): string {
  if (cell.state === "found") return "✅";
  if (cell.state === "exploded") return "💣";
  if (cell.state === "revealed") return "⬜";
  return "⬛";
}

export function gridToShareLines(grid: MinadoGrid): string[] {
  return grid.map((row) => row.map(cellEmoji).join(""));
}

export function buildShareText(grids: MinadoGrid[], solvedFinal: boolean, gameNumber?: number): string {
  const label = gameNumber ? `Minado #${gameNumber}` : "Minado";
  const header = `${label}${solvedFinal ? " ✅" : " ❌"}`;
  const boards = grids.map((grid) => gridToShareLines(grid).join("\n")).join("\n\n");
  return `${header}\n\n${boards}`;
}
