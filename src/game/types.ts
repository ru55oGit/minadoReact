// Cada tablero de Minado esconde UNA palabra-pista: sus letras quedan
// dispersas al azar por TODA la grilla (no en una fila), igual que las
// minas de un buscaminas real. El resto son celdas "simples".
//
// Un buscaminas común, con riesgo real de los dos lados:
// - Tocar (revelar) una celda simple oculta: SIEMPRE segura, muestra un
//   número = cantidad de letras en las 8 celdas vecinas — si da 0, se
//   expande en cadena (destape en bloque, ver floodReveal en grid.ts).
// - Tocar (revelar) una celda de LETRA sin marcarla antes: es una bomba —
//   resta una vida y esa celda queda perdida para siempre ("exploded").
// - Marcar con bandera (click derecho / toggle en mobile) ya no es un
//   marcador gratis — es una apuesta: si la celda es de letra, acierto,
//   la reclama de forma segura ("found", solo se ve la banderita, no la
//   letra); si es simple, error, se destapa igual (mostrando su número)
//   pero resta una vida, igual que pisar una bomba.
//
// La grilla no se genera hasta el primer toque: recién ahí se sortean las
// posiciones de las letras, excluyendo esa celda y sus 8 vecinas (primer
// toque siempre seguro, igual que el buscaminas real).

export type CellKind = "letter" | "plain";
export type CellState = "hidden" | "revealed" | "found" | "exploded";

export interface Cell {
  kind: CellKind;
  // Solo si kind === "letter".
  letter?: string;
  // Solo si kind === "letter": posición de esa letra dentro de la palabra
  // combinada que se usó para generar la grilla (clueWords del puzzle
  // activo, unidas) — permite, al reclamarla, saber a qué pista pertenece y en
  // qué lugar de ESA pista va (necesario desde que las 4 pistas viven en
  // una sola grilla: el valor de la letra sola no alcanza para distinguir
  // "la E de EDEN" de "la E de EVA").
  sourceIndex?: number;
  state: CellState;
  // Solo si kind === "plain": cantidad de celdas de letra entre sus 8
  // vecinas — se calcula una sola vez al generar la grilla.
  adjacent?: number;
}

export type MinadoGrid = Cell[][];

export interface GridPos {
  r: number;
  c: number;
}
