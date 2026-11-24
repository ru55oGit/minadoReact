import { Cell, GridPos, MinadoGrid } from "./types";

// Grilla fija 10x10 para cualquier palabra-pista — a diferencia de la
// versión anterior (tamaño según el largo de la palabra), ahora las
// letras no van en una fila sino dispersas al azar por toda la grilla,
// así que el tamaño no depende de cuánto mida la palabra.
export const GRID_SIZE = 10;

const NEIGHBOR_OFFSETS: GridPos[] = [
  { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
  { r: 0, c: -1 }, { r: 0, c: 1 },
  { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 },
];

// Grilla "sin generar": todas las celdas simples, nada de letras todavía
// — recién se deciden sus posiciones en placeLettersRandomly, en el
// primer toque, para garantizar que ese primer toque sea siempre seguro
// (igual que el buscaminas real).
export function createEmptyGrid(size: number = GRID_SIZE): MinadoGrid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, (): Cell => ({ kind: "plain", state: "hidden", flagged: false })),
  );
}

function allFreeCells(size: number, excluded: Set<string>, used: Set<string>): GridPos[] {
  const free: GridPos[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r}-${c}`;
      if (!excluded.has(key) && !used.has(key)) free.push({ r, c });
    }
  }
  return free;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Divide la grilla en una cuadrícula de REGIONS_PER_SIDE x REGIONS_PER_SIDE
// regiones lo más parejas posible (el resto de la división se reparte
// entre las últimas regiones de cada fila/columna).
const REGIONS_PER_SIDE = 3;

interface Region {
  rStart: number;
  rEnd: number;
  cStart: number;
  cEnd: number;
}

export function buildRegions(size: number): Region[] {
  const base = Math.floor(size / REGIONS_PER_SIDE);
  const extra = size % REGIONS_PER_SIDE;
  const bounds = [0];
  for (let i = 0; i < REGIONS_PER_SIDE; i++) {
    bounds.push(bounds[i] + base + (i < extra ? 1 : 0));
  }
  const regions: Region[] = [];
  for (let ri = 0; ri < REGIONS_PER_SIDE; ri++) {
    for (let ci = 0; ci < REGIONS_PER_SIDE; ci++) {
      regions.push({ rStart: bounds[ri], rEnd: bounds[ri + 1], cStart: bounds[ci], cEnd: bounds[ci + 1] });
    }
  }
  return regions;
}

// Sortea las posiciones de las letras de `word`, repartidas por REGIONES
// de la grilla (no un sorteo 100% uniforme sobre las 100 celdas) — con
// pocas letras en una grilla grande, un sorteo uniforme puede (con mala
// suerte) agruparlas todas en un rincón, dejando el resto del tablero
// como un único mar vacío sin ninguna pista cerca (reporte real: "queda
// mucho espacio vacío"). Dividiendo en 9 regiones y sorteando una letra
// por región distinta (reiniciando el ciclo si hay más letras que
// regiones) quedan bien distribuidas por toda la superficie. `exclude` y
// sus 8 vecinas (9 celdas en total) nunca pueden tener una letra, para
// que el primer toque del jugador sea siempre seguro. Calcula el número
// de cada celda simple una sola vez, ya con las letras puestas. Devuelve
// una grilla nueva (no muta la que recibe).
export function placeLettersRandomly(grid: MinadoGrid, word: string, exclude: GridPos): MinadoGrid {
  const size = grid.length;
  const upper = word.toUpperCase();

  const excluded = new Set<string>();
  for (const off of [{ r: 0, c: 0 }, ...NEIGHBOR_OFFSETS]) {
    const nr = exclude.r + off.r;
    const nc = exclude.c + off.c;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) excluded.add(`${nr}-${nc}`);
  }

  const regionOrder = shuffle(buildRegions(size));
  const usedCells = new Set<string>();
  const positions: GridPos[] = [];

  for (let i = 0; i < upper.length; i++) {
    const region = regionOrder[i % regionOrder.length];
    const candidates: GridPos[] = [];
    for (let r = region.rStart; r < region.rEnd; r++) {
      for (let c = region.cStart; c < region.cEnd; c++) {
        const key = `${r}-${c}`;
        if (!excluded.has(key) && !usedCells.has(key)) candidates.push({ r, c });
      }
    }
    // Si la región ya se quedó sin celdas libres (muy improbable con el
    // tamaño de región actual), cae a cualquier celda libre de toda la
    // grilla en vez de romper — mejor amontonada que faltante.
    const pool = candidates.length > 0 ? candidates : allFreeCells(size, excluded, usedCells);
    const choice = pool[Math.floor(Math.random() * pool.length)];
    usedCells.add(`${choice.r}-${choice.c}`);
    positions.push(choice);
  }

  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  for (let i = 0; i < upper.length; i++) {
    const { r, c } = positions[i];
    next[r][c] = { kind: "letter", letter: upper[i], state: "hidden" };
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (next[r][c].kind !== "plain") continue;
      let count = 0;
      for (const off of NEIGHBOR_OFFSETS) {
        const nr = r + off.r;
        const nc = c + off.c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (next[nr][nc].kind === "letter") count += 1;
      }
      next[r][c].adjacent = count;
    }
  }

  return next;
}

// Destape en bloque, igual que el buscaminas real: revela `start` (si es
// una celda simple oculta) y, si su número da 0, encadena a sus 8
// vecinas — y así sucesivamente mientras sigan dando 0 — revelando
// también la primera capa de celdas CON número que encuentra en el
// camino (ahí frena, no sigue de largo). Nunca toca celdas de letra (la
// cadena solo avanza por celdas simples) ni celdas ya reveladas/marcadas.
// Devuelve una copia nueva de la grilla; no muta la que recibe.
export function floodReveal(grid: MinadoGrid, start: GridPos): MinadoGrid {
  const size = grid.length;
  const next = grid.map((row) => row.slice());
  const queue: GridPos[] = [start];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const pos = queue.pop()!;
    const key = `${pos.r}-${pos.c}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const target = next[pos.r]?.[pos.c];
    if (!target || target.kind !== "plain" || target.state !== "hidden" || target.flagged) continue;

    next[pos.r][pos.c] = { ...target, state: "revealed" };

    if (target.adjacent === 0) {
      for (const off of NEIGHBOR_OFFSETS) {
        const nr = pos.r + off.r;
        const nc = pos.c + off.c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) queue.push({ r: nr, c: nc });
      }
    }
  }

  return next;
}

export function countPlainCells(grid: MinadoGrid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.kind === "plain") count += 1;
    }
  }
  return count;
}
