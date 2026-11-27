import { useCallback, useEffect, useRef, useState } from "react";
import { GRID_SIZE, createEmptyGrid, floodReveal, placeLettersRandomly } from "../game/grid";
import { GridPos, MinadoGrid } from "../game/types";
import { playRevealSound, playFlagSound, playLoseLifeSound } from "../utils/sound";

export type BoardPhase = "playing" | "solved" | "lost";

// Pisar una bomba (revelar una celda de letra sin marcarla antes) o
// marcar con bandera una celda que resultó NO tener letra (una apuesta
// equivocada) ya no terminan el tablero de una — cada una resta una
// vida; recién cuando se te acaban las 3, la fase pasa a "lost" (reporte
// real: "es más difícil de lo que creí... que recién levante el
// popup... cuando pierda las 3 vidas" + "que una bandera errónea tb
// pierda vidas").
export const MAX_LIVES = 3;

// `sourceIndex` es la posición de esa letra dentro de la palabra
// combinada (ver Cell en types.ts) — lo que permite, afuera de este hook,
// reconstruir a qué pista pertenece cada letra encontrada.
export interface FoundLetter {
  letter: string;
  sourceIndex: number;
}

// Un tablero por palabra-pista — buscaminas común, con riesgo real de
// los dos lados:
// - revealCell (tocar): celda simple -> SIEMPRE segura, muestra su número
//   de letras vecinas (o destapa en bloque si da 0); celda de letra SIN
//   marcar antes -> bomba, resta una vida y esa celda queda perdida para
//   siempre.
// - flagCell (click derecho / toggle "Bandera" en mobile): es una
//   apuesta, ya no un marcador reversible sin costo — celda de letra ->
//   acierto, la reclama de forma segura (se suma a lo encontrado,
//   mostrando solo la banderita, no la letra); celda simple -> error, se
//   destapa igual (nunca estuvo en riesgo CONOCER su número, el riesgo
//   está en la apuesta) y resta una vida, igual que pisar una bomba.
//
// Importante: ningún updater de setState llama a OTRO setState desde
// adentro acá — React 18 en StrictMode invoca dos veces los updaters
// para detectar impurezas, y un side-effect anidado (como llamar
// setFoundLetters desde dentro del updater de setGrid) se ejecuta las
// DOS veces de verdad, duplicando el resultado (bug real ya encontrado:
// "letras duplicadas"). Todo se calcula primero como valores planos
// (leyendo `gridRef`/`foundRef`/`livesRef`, nunca un callback-updater) y
// recién después se asignan de una sola pasada con setX(valorPlano).
export function useMinadoBoard(word: string, size: number = GRID_SIZE) {
  const [grid, setGrid] = useState<MinadoGrid>(() => createEmptyGrid(size));
  const [foundLetters, setFoundLetters] = useState<FoundLetter[]>([]);
  const [phase, setPhase] = useState<BoardPhase>("playing");
  const [lives, setLives] = useState(MAX_LIVES);
  const gridRef = useRef(grid);
  const foundRef = useRef(foundLetters);
  const livesRef = useRef(lives);

  function resetBoard() {
    const fresh = createEmptyGrid(size);
    gridRef.current = fresh;
    foundRef.current = [];
    livesRef.current = MAX_LIVES;
    setGrid(fresh);
    setFoundLetters([]);
    setPhase("playing");
    setLives(MAX_LIVES);
  }

  useEffect(() => {
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    playFlagSound();
    if (next.length === word.length) setPhase("solved");
  }

  function loseLife() {
    const remainingLives = livesRef.current - 1;
    livesRef.current = remainingLives;
    setLives(remainingLives);
    playLoseLifeSound();
    if (remainingLives <= 0) setPhase("lost");
  }

  const revealCell = useCallback(
    ({ r, c }: GridPos) => {
      if (phase !== "playing") return;
      const base = ensureGenerated({ r, c });
      const cell = base[r][c];
      if (cell.state !== "hidden") {
        if (base !== gridRef.current) commitGrid(base);
        return;
      }

      if (cell.kind === "letter") {
        const next = base.map((row) => row.slice());
        next[r][c] = { ...cell, state: "exploded" };
        commitGrid(next);
        loseLife();
        return;
      }

      commitGrid(floodReveal(base, { r, c }));
      playRevealSound();
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
        commitGrid(floodReveal(base, { r, c }));
        loseLife();
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

  return { grid, foundLetters, phase, lives, revealCell, flagCell, reset: resetBoard };
}
