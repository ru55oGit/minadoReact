import { describe, expect, it } from "vitest";
import { GRID_SIZE, buildRegions, countPlainCells, createEmptyGrid, floodReveal, placeLettersRandomly } from "./grid";

describe("createEmptyGrid", () => {
  it("creates a GRID_SIZE x GRID_SIZE grid with no letters yet", () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(GRID_SIZE);
    expect(grid[0].length).toBe(GRID_SIZE);
    expect(grid.flat().every((cell) => cell.kind === "plain")).toBe(true);
  });
});

describe("placeLettersRandomly", () => {
  it("spreads letters across distinct 3x3-grid regions instead of letting them cluster by chance", () => {
    // Con 5 letras y 9 regiones disponibles, cada una tiene que caer en
    // una región distinta — si cayeran todas por sorteo uniforme podrían
    // (con mala suerte) agruparse en un rincón, dejando el resto de la
    // grilla como un único mar vacío sin ninguna pista cerca (reporte
    // real: "queda mucho espacio vacío").
    const grid = createEmptyGrid();
    const next = placeLettersRandomly(grid, "FRUTA", { r: 9, c: 9 });
    const regions = buildRegions(GRID_SIZE);

    const regionIndexOf = (r: number, c: number) =>
      regions.findIndex((reg) => r >= reg.rStart && r < reg.rEnd && c >= reg.cStart && c < reg.cEnd);

    const regionsUsed = new Set<number>();
    next.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.kind === "letter") regionsUsed.add(regionIndexOf(r, c));
      }),
    );
    expect(regionsUsed.size).toBe(5);
  });

  it("places exactly one cell per letter of the word, and never on the excluded cell or its neighbors", () => {
    const grid = createEmptyGrid();
    const exclude = { r: 5, c: 5 };
    const next = placeLettersRandomly(grid, "FRUTA", exclude);

    const letterCells = next.flat().filter((cell) => cell.kind === "letter");
    expect(letterCells).toHaveLength(5);

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        expect(next[exclude.r + dr][exclude.c + dc].kind).toBe("plain");
      }
    }
  });

  it("gives every plain cell an adjacent-letter count matching its real neighbors", () => {
    const grid = createEmptyGrid();
    const next = placeLettersRandomly(grid, "EVA", { r: 0, c: 0 });

    next.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.kind !== "plain") return;
        let expected = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= next.length || nc < 0 || nc >= next.length) continue;
            if (next[nr][nc].kind === "letter") expected += 1;
          }
        }
        expect(cell.adjacent).toBe(expected);
      });
    });
  });

  it("countPlainCells + letter count add up to every cell in the grid", () => {
    const grid = createEmptyGrid();
    const next = placeLettersRandomly(grid, "EDEN", { r: 9, c: 9 });
    expect(countPlainCells(next) + "EDEN".length).toBe(GRID_SIZE * GRID_SIZE);
  });
});

describe("floodReveal", () => {
  it("reveals a single cell when it already has a number (no se expande)", () => {
    const grid = placeLettersRandomly(createEmptyGrid(), "EVA", { r: 0, c: 0 });
    const withNumber = grid.flat().find((cell) => cell.kind === "plain" && (cell.adjacent ?? 0) > 0);
    expect(withNumber).toBeDefined();

    let target = { r: 0, c: 0 };
    outer: for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid.length; c++) {
        if (grid[r][c] === withNumber) {
          target = { r, c };
          break outer;
        }
      }
    }

    const next = floodReveal(grid, target);
    const revealedCount = next.flat().filter((cell) => cell.state === "revealed").length;
    expect(revealedCount).toBe(1);
  });

  it("cascades through connected 0-cells and never reveals a letter cell", () => {
    const grid = placeLettersRandomly(createEmptyGrid(), "EVA", { r: 0, c: 0 });
    expect(grid[0][0].adjacent).toBe(0);

    const next = floodReveal(grid, { r: 0, c: 0 });
    const revealedCount = next.flat().filter((cell) => cell.state === "revealed").length;
    expect(revealedCount).toBeGreaterThan(1);

    const revealedLetters = next.flat().filter((cell) => cell.kind === "letter" && cell.state !== "hidden");
    expect(revealedLetters).toHaveLength(0);
  });
});
