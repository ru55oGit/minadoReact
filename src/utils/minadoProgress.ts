import { WEEK_DAY_KEYS, isDayAvailable, dateKeyForDayKey, SupportedLanguage } from "../data/dailyPuzzles";

// Progreso por día, simplificado respecto al de enroscaloReact (que
// guarda estado letra por letra): acá cada día solo tiene un resultado
// final (acertaste / no acertaste la palabra final), suficiente para que
// la Home muestre el estado de la semana y para no dejar reiniciar un
// día ya jugado.
export interface DayProgress {
  status: "not_started" | "completed";
  correct: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "minado_progress_v1";
const NOT_STARTED: DayProgress = { status: "not_started", correct: false, updatedAt: "" };

interface ProgressStore {
  [scopeKey: string]: DayProgress;
}

function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) — no
    // rompe el juego, solo no persiste entre visitas.
  }
}

export function getDayProgress(scopeKey: string): DayProgress {
  return loadStore()[scopeKey] ?? NOT_STARTED;
}

export function saveDayProgress(scopeKey: string, correct: boolean): void {
  const store = loadStore();
  store[scopeKey] = { status: "completed", correct, updatedAt: new Date().toISOString() };
  saveStore(store);
}

// El idioma va DENTRO de la clave — si cambiás de idioma a mitad de
// semana, el progreso de cada idioma queda separado (no se mezcla ni se
// pisa entre sí).
export function scopeKeyFor(language: SupportedLanguage, dateKey: string): string {
  return `${language}:${dateKey}`;
}

export function bonusScopeKey(language: SupportedLanguage, dateKey: string): string {
  return `${language}:bonus:${dateKey}`;
}

// El bonus se desbloquea cuando ya jugaste todos los días de la semana
// que estaban disponibles (mismo criterio que enroscaloReact: el bonus
// es la recompensa por engancharte con el set normal) — compartido entre
// Home (para pintar el candado) y game.tsx (para no poder esquivarlo
// entrando directo por la URL).
export function isBonusUnlocked(language: SupportedLanguage, referenceDate: Date = new Date()): boolean {
  return WEEK_DAY_KEYS.every((key) => {
    if (!isDayAvailable(key, referenceDate)) return true;
    return getDayProgress(scopeKeyFor(language, dateKeyForDayKey(key, referenceDate))).status === "completed";
  });
}
