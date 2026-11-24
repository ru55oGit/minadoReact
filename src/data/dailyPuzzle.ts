// Prototipo: un solo día hardcodeado (el ejemplo que armó el usuario). El
// set real de pistas/días queda para la próxima pasada (ver nota en el
// pedido original: "después vemos el set de info como lo armamos").
export interface DailyPuzzle {
  clueWords: string[];
  answer: string;
}

export const TODAY_PUZZLE: DailyPuzzle = {
  clueWords: ["FRUTA", "ROJA", "EDEN", "EVA"],
  answer: "MANZANA",
};
