import Hypher from "hypher";
import spanishHyphenation from "hyphenation.es";

// Portado tal cual de enroscaloReact/src/pages/game.tsx: cuando la
// palabra no entra en una sola fila de casillas, el corte a la segunda
// fila tiene que caer en un límite de SÍLABA (no en cualquier letra), para
// no partir "MANZANA" como "MANZA-NA" en un lugar raro.
const spanishHypher = new Hypher(spanishHyphenation as Record<string, unknown>);

const isVowelChar = (c: string): boolean => /[aeiouáéíóúü]/i.test(c);

// Respaldo si Hypher no devuelve nada útil: busca hacia atrás, desde el
// máximo permitido, una transición vocal/consonante (heurística barata de
// límite de sílaba).
export function getRecommendedBreakPoint(chars: string[], maxChunkLength: number): number {
  const safeMax = Math.max(2, Math.min(maxChunkLength, chars.length - 1));
  const preferredMin = Math.max(2, safeMax - 3);
  for (let i = safeMax; i >= preferredMin; i -= 1) {
    const prev = chars[i - 1];
    const next = chars[i];
    if (!prev || !next) continue;
    if (isVowelChar(prev) !== isVowelChar(next) || (isVowelChar(prev) && isVowelChar(next))) return i;
  }
  return safeMax;
}

// Principal: usa el diccionario de sílabas en español de Hypher y elige
// el límite de sílaba más grande que entre en maxChunkLength (para que la
// primera fila quede lo más llena posible sin cortar una sílaba).
export function getSyllableBreakPoint(word: string, maxChunkLength: number): number | null {
  if (!word || maxChunkLength < 2 || word.length <= 2) return null;
  const safeMax = Math.max(2, Math.min(maxChunkLength, word.length - 1));
  if (safeMax < 2) return null;

  const syllables = spanishHypher.hyphenate(word);
  if (!Array.isArray(syllables) || syllables.length <= 1) return null;

  const breakpoints: number[] = [];
  let consumed = 0;
  syllables.slice(0, -1).forEach((syl: string) => {
    consumed += syl.length;
    breakpoints.push(consumed);
  });

  const strong = breakpoints.filter((p) => p >= 2 && p <= safeMax && word.length - p >= 2);
  if (strong.length > 0) return strong[strong.length - 1];

  const weak = breakpoints.filter((p) => p >= 2 && p <= safeMax);
  if (weak.length > 0) return weak[weak.length - 1];

  return null;
}
