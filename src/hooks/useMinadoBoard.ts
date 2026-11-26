import { useCallback, useEffect, useRef, useState } from "react";
import { GRID_SIZE, createEmptyGrid, floodReveal, placeLettersRandomly } from "../game/grid";
import { GridPos, MinadoGrid } from "../game/types";

export type BoardPhase = "playing" | "solved" | "lost";

// `sourceIndex` es la posición de esa letra dentro de la palabra
// combinada (ver Cell en types.ts) — lo que permite, afuera de este hook,
// reconstruir a qué pista pertenece cada letra encontrada.
export interface FoundLetter {
  letter: string;
  sourceIndex: number;
}

// Un tablero por palabra-pista — buscaminas común, con riesgo real:
// - revealCell (tocar): celda simple -> SIEMPRE segura, muestra su número
//   de letras vecinas (o destapa en bloque si da 0); celda de letra SIN
//   marcar antes -> bomba, se pierde esta pista (fase "lost") y se pasa a
//   adivinar con lo que ya se había encontrado hasta ese momento.
// - flagCell (click derecho / toggle "Bandera" en mobile): celda de letra
//   -> la reclama de forma segura (fase sigue "playing" o pasa a "solved"
//   si era la última), mostrando solo la banderita en la grilla, no la
//   letra; celda simple -> solo la marca con 🚩 (reversible, no revela).
//
// Importante: ningún updater de setState llama a OTRO setState desde
// adentro acá — React 18 en StrictMode invoca dos veces los updaters
// para detectar impurezas, y un side-effect anidado (como llamar
// setFoundLetters desde dentro del updater de setGrid) se ejecuta las
// DOS veces de verdad, duplicando el resultado (bug real ya encontrado:
// "letras duplicadas"). Todo se calcula primero como valores planos
// (leyendo `gridRef`/`foundRef`, nunca un callback-updater) y recién
// después se asignan de una sola pasada con setX(valorPlano).
export function useMinadoBoard(word: string, size: number = GRID_SIZE) {
  const [grid, setGrid] = useState<MinadoGrid>(() => createEmptyGrid(size));
  const [foundLetters, setFoundLetters] = useState<FoundLetter[]>([]);
  const [phase, setPhase] = useState<BoardPhase>("playing");
  const gridRef = useRef(grid);
  const foundRef = useRef(foundLetters);

  useEffect(() => {
    const fresh = createEmptyGrid(size);
    gridRef.current = fresh;
    foundRef.current = [];
    setGrid(fresh);
    setFoundLetters([]);
    setPhase("playing");
  }, [word, size]);

  function ensureGenerated(pos: GridPos): MinadoGrid {
    const current = gridRef.current;
    const alreadyGenerated = current.some((row) => row.some((cell) => cell.kind === "letter"));
    if (alreadyGenerated) return current;
    const next = placeLettersRandomly(current, word, pos);
    gridRef.current = next;
    return next;
  }

  function commitGrid(next: MinadoGrid) {
    gridRef.current = next;
    setGrid(next);
  }

  function commitFoundLetter(letter: string, sourceIndex: number) {
    const next = [...foundRef.current, { letter, sourceIndex }];
    foundRef.current = next;
    setFoundLetters(next);
    if (next.length === word.length) setPhase("solved");
  }

  const revealCell = useCallback(
    ({ r, c }: GridPos) => {
      if (phase !== "playing") return;
      const base = ensureGenerated({ r, c });
      const cell = base[r][c];
      if (cell.state !== "hidden" || cell.flagged) {
        if (base !== gridRef.current) commitGrid(base);
        return;
      }

      if (cell.kind === "letter") {
        const next = base.map((row) => row.slice());
        next[r][c] = { ...cell, state: "exploded" };
        commitGrid(next);
        setPhase("lost");
        return;
      }

      commitGrid(floodReveal(base, { r, c }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, word],
  );

  const flagCell = useCallback(
    ({ r, c }: GridPos) => {
      if (phase !== "playing") return;
      const base = ensureGenerated({ r, c });
      const cell = base[r][c];
      if (cell.state !== "hidden") {
        if (base !== gridRef.current) commitGrid(base);
        return;
      }

      if (cell.kind === "plain") {
        const next = base.map((row) => row.slice());
        next[r][c] = { ...cell, flagged: !cell.flagged };
        commitGrid(next);
        return;
      }

      const next = base.map((row) => row.slice());
      next[r][c] = { ...cell, state: "found" };
      commitGrid(next);
      commitFoundLetter(cell.letter!, cell.sourceIndex!);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, word],
  );

  return { grid, foundLetters, phase, revealCell, flagCell };
}
