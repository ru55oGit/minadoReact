// "Uno por día", mismo criterio que enroscaloReact: un set fijo de
// puzzles que rota por fecha calendario (ancla + módulo), NO al azar en
// cada visita — todos los que entren el mismo día, en el mismo idioma,
// ven la misma pista. A diferencia de enroscalo (que arma un rosco de 7
// días distinto por semana), acá hay UN solo puzzle por día, así que el
// ciclo es directamente sobre la lista completa, sin la capa extra de
// "set semanal".
export type SupportedLanguage = "es" | "en" | "pt";

export interface DailyPuzzle {
  clueWords: string[];
  answer: string;
}

// Set normal: 7 puzzles por idioma, uno por día, cíclico. Los sets en/pt
// no son traducciones literales del de es — son equivalentes propios en
// cada idioma (mismo criterio: 4 pistas cortas que son hints hacia una
// palabra final relacionada). Sin tildes/cedillas en ningún idioma —
// simplifica el teclado y la validación (una sola capa, no hace falta un
// teclado especial por idioma como en enroscaloReact).
const DAILY_PUZZLES: Record<SupportedLanguage, DailyPuzzle[]> = {
  es: [
    { clueWords: ["FRUTA", "ROJA", "EDEN", "EVA"], answer: "MANZANA" },
    { clueWords: ["NOCHE", "CIELO", "FASE", "PLATA"], answer: "LUNA" },
    { clueWords: ["ITALIA", "QUESO", "MASA", "HORNO"], answer: "PIZZA" },
    { clueWords: ["ARENA", "SOL", "MAR", "VERANO"], answer: "PLAYA" },
    { clueWords: ["FELINO", "MAULLA", "BIGOTE", "AGIL"], answer: "GATO" },
    { clueWords: ["GRANO", "NEGRO", "TAZA", "AROMA"], answer: "CAFE" },
    { clueWords: ["BRILLA", "NOCTURNA", "LEJANA", "DESEO"], answer: "ESTRELLA" },
  ],
  en: [
    { clueWords: ["FRUIT", "RED", "EDEN", "EVE"], answer: "APPLE" },
    { clueWords: ["NIGHT", "SKY", "PHASE", "SILVER"], answer: "MOON" },
    { clueWords: ["ITALY", "CHEESE", "DOUGH", "OVEN"], answer: "PIZZA" },
    { clueWords: ["SAND", "SUN", "SEA", "SUMMER"], answer: "BEACH" },
    { clueWords: ["FELINE", "MEOWS", "WHISKER", "AGILE"], answer: "CAT" },
    { clueWords: ["BEAN", "BLACK", "MUG", "AROMA"], answer: "COFFEE" },
    { clueWords: ["SHINE", "DISTANT", "WISH", "SPARKLE"], answer: "STAR" },
  ],
  pt: [
    { clueWords: ["FRUTA", "VERMELHA", "PEQUENA", "DOCE"], answer: "CEREJA" },
    { clueWords: ["NOITE", "CEU", "FASE", "PRATA"], answer: "LUA" },
    { clueWords: ["ITALIA", "QUEIJO", "MASSA", "FORNO"], answer: "PIZZA" },
    { clueWords: ["AREIA", "SOL", "MAR", "VERAO"], answer: "PRAIA" },
    { clueWords: ["FELINO", "MIADO", "BIGODE", "AGIL"], answer: "GATO" },
    { clueWords: ["GRAO", "PRETO", "XICARA", "AROMA"], answer: "CAFE" },
    { clueWords: ["BRILHA", "NOTURNA", "DISTANTE", "DESEJO"], answer: "ESTRELA" },
  ],
};

// Set bonus: mismo formato, para cuando el jugador ya se enganchó con el
// de todos los días — rota con su propio ciclo independiente, sobre una
// lista más chica.
const BONUS_PUZZLES: Record<SupportedLanguage, DailyPuzzle[]> = {
  es: [
    { clueWords: ["PIRATA", "TESORO", "ISLA", "MAPA"], answer: "COFRE" },
    { clueWords: ["MAGIA", "HECHIZO", "VARITA", "POCION"], answer: "BRUJA" },
    { clueWords: ["ESPACIO", "COHETE", "PLANETA", "ORBITA"], answer: "ASTRONAUTA" },
  ],
  en: [
    { clueWords: ["PIRATE", "TREASURE", "ISLAND", "MAP"], answer: "CHEST" },
    { clueWords: ["MAGIC", "SPELL", "WAND", "POTION"], answer: "WITCH" },
    { clueWords: ["SPACE", "ROCKET", "PLANET", "ORBIT"], answer: "ASTRONAUT" },
  ],
  pt: [
    { clueWords: ["PIRATA", "TESOURO", "ILHA", "MAPA"], answer: "BAU" },
    { clueWords: ["MAGIA", "FEITICO", "VARINHA", "POCAO"], answer: "BRUXA" },
    { clueWords: ["ESPACO", "FOGUETE", "PLANETA", "ORBITA"], answer: "ASTRONAUTA" },
  ],
};

// Ancla fija (día 1 del set normal) + módulo sobre la cantidad de
// puzzles — mismo patrón que CYCLE_BASE_DATE de enroscaloReact, pero sin
// la capa de "semana": acá el día calendario mapea directo a un índice
// de la lista. Misma ancla para los 3 idiomas, así un mismo día siempre
// cae en el mismo ÍNDICE (puzzle "equivalente") sin importar el idioma.
const ANCHOR_DATE = "2025-01-01";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysSinceAnchor(referenceDate: Date): number {
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00`);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Math.floor((ref.getTime() - anchor.getTime()) / MS_PER_DAY);
}

// Módulo "a la matemática" (siempre positivo), para que fechas anteriores
// al ancla también den un índice válido en vez de uno negativo.
function cyclicIndex(value: number, length: number): number {
  return ((value % length) + length) % length;
}

export function getTodayPuzzle(referenceDate: Date = new Date(), language: SupportedLanguage = "es"): DailyPuzzle {
  const list = DAILY_PUZZLES[language];
  return list[cyclicIndex(daysSinceAnchor(referenceDate), list.length)];
}

// Número de puzzle estilo Wordle ("Minado #N") para el texto de
// compartir — mismo criterio que getGameNumber de enroscaloReact. No
// depende del idioma (cuenta días, no puzzles).
export function getGameNumber(referenceDate: Date = new Date()): number {
  return daysSinceAnchor(referenceDate) + 1;
}

export function getBonusPuzzle(index: number, language: SupportedLanguage = "es"): DailyPuzzle {
  const list = BONUS_PUZZLES[language];
  return list[cyclicIndex(index, list.length)];
}

// Qué bonus toca "hoy" si el jugador entra sin pedir uno en particular.
export function getTodayBonusPuzzle(referenceDate: Date = new Date(), language: SupportedLanguage = "es"): DailyPuzzle {
  return getBonusPuzzle(daysSinceAnchor(referenceDate), language);
}

// --- Semana + calendario en la Home (portado de enroscaloReact: mismos
// WEEK_DAYS/getCurrentDayKey/isDayAvailable, mismo esquema de ruta
// /game?day=<key>|bonus) ---

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

// Solo las claves (el orden importa) — las etiquetas visibles ("Lunes"/
// "Monday"/"Segunda") viven en translations.ts, por idioma.
export const WEEK_DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function getCurrentDayKey(referenceDate: Date = new Date()): DayKey {
  return WEEK_DAY_KEYS[referenceDate.getDay()];
}

export function isDayKey(value: string | null): value is DayKey {
  return WEEK_DAY_KEYS.includes(value as DayKey);
}

// Un día de la semana ACTUAL es "disponible" si no es futuro respecto de
// hoy — no se puede jugar por adelantado (mismo criterio que
// enroscaloReact), pero sí revisar los días ya pasados de esta semana.
export function isDayAvailable(dayKey: DayKey, referenceDate: Date = new Date()): boolean {
  const targetIndex = WEEK_DAY_KEYS.indexOf(dayKey);
  return targetIndex >= 0 && targetIndex <= referenceDate.getDay();
}

// Fecha real (de ESTA semana) que le corresponde a un día de la semana —
// p.ej. si hoy es jueves, "lun" cae 3 días atrás y "sat" 2 días adelante.
function dateForDayKeyThisWeek(dayKey: DayKey, referenceDate: Date = new Date()): Date {
  const targetIndex = WEEK_DAY_KEYS.indexOf(dayKey);
  const diff = targetIndex - referenceDate.getDay();
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + diff);
}

export function getPuzzleForDayKey(
  dayKey: DayKey,
  referenceDate: Date = new Date(),
  language: SupportedLanguage = "es",
): DailyPuzzle {
  return getTodayPuzzle(dateForDayKeyThisWeek(dayKey, referenceDate), language);
}

// Clave estable por fecha calendario real (no por día de la semana — así
// un mismo "lunes" de semanas distintas no comparte progreso guardado,
// cada ocurrencia de "uno por día" es su propio día).
export function dateKeyForDayKey(dayKey: DayKey, referenceDate: Date = new Date()): string {
  const date = dateForDayKeyThisWeek(dayKey, referenceDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
