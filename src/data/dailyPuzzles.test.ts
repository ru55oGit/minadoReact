import { describe, expect, it } from "vitest";
import {
  WEEK_DAY_KEYS,
  getTodayPuzzle,
  getGameNumber,
  getBonusPuzzle,
  getTodayBonusPuzzle,
  getCurrentDayKey,
  isDayKey,
  isDayAvailable,
  getPuzzleForDayKey,
  dateKeyForDayKey,
} from "./dailyPuzzles";

const LANGUAGES = ["es", "en", "pt"] as const;

describe("getTodayPuzzle", () => {
  it.each(LANGUAGES)("is deterministic for the same calendar day (%s)", (lang) => {
    const morning = new Date("2025-03-10T06:00:00");
    const night = new Date("2025-03-10T23:30:00");
    expect(getTodayPuzzle(morning, lang)).toBe(getTodayPuzzle(night, lang));
  });

  it.each(LANGUAGES)("cycles through all 7 puzzles over 7 consecutive days (%s)", (lang) => {
    const seen = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(2025, 0, 1 + i);
      seen.add(getTodayPuzzle(date, lang).answer);
    }
    expect(seen.size).toBe(7);
  });

  it("repeats the same puzzle after a full cycle", () => {
    const first = getTodayPuzzle(new Date(2025, 0, 1));
    const afterOneCycle = getTodayPuzzle(new Date(2025, 0, 8));
    expect(afterOneCycle).toBe(first);
  });

  it("also works for dates before the anchor (no negative index)", () => {
    expect(() => getTodayPuzzle(new Date(2020, 0, 1))).not.toThrow();
  });

  it("defaults to the Spanish set when no language is given", () => {
    expect(getTodayPuzzle(new Date(2025, 0, 1))).toBe(getTodayPuzzle(new Date(2025, 0, 1), "es"));
  });
});

describe("getGameNumber", () => {
  it("starts at 1 on the anchor date and increases by one per day", () => {
    expect(getGameNumber(new Date(2025, 0, 1))).toBe(1);
    expect(getGameNumber(new Date(2025, 0, 2))).toBe(2);
    expect(getGameNumber(new Date(2025, 0, 8))).toBe(8);
  });
});

describe("bonus puzzles", () => {
  it.each(LANGUAGES)("getBonusPuzzle cycles through the bonus list (%s)", (lang) => {
    const first = getBonusPuzzle(0, lang);
    const afterFullCycle = getBonusPuzzle(3, lang);
    expect(afterFullCycle).toBe(first);
  });

  it.each(LANGUAGES)("getTodayBonusPuzzle is deterministic for the same calendar day (%s)", (lang) => {
    const morning = new Date("2025-03-10T06:00:00");
    const night = new Date("2025-03-10T23:30:00");
    expect(getTodayBonusPuzzle(morning, lang)).toBe(getTodayBonusPuzzle(night, lang));
  });
});

describe("week days / calendar helpers", () => {
  it("getCurrentDayKey matches JS's own day-of-week numbering", () => {
    // 2025-03-09 es domingo, 2025-03-10 es lunes.
    expect(getCurrentDayKey(new Date(2025, 2, 9))).toBe("sun");
    expect(getCurrentDayKey(new Date(2025, 2, 10))).toBe("mon");
  });

  it("isDayKey only accepts the 7 valid keys", () => {
    expect(isDayKey("mon")).toBe(true);
    expect(isDayKey("bonus")).toBe(false);
    expect(isDayKey(null)).toBe(false);
  });

  it("isDayAvailable allows today and past days of this week, blocks future ones", () => {
    const wednesday = new Date(2025, 2, 12); // miércoles
    expect(isDayAvailable("sun", wednesday)).toBe(true);
    expect(isDayAvailable("wed", wednesday)).toBe(true);
    expect(isDayAvailable("thu", wednesday)).toBe(false);
    expect(isDayAvailable("sat", wednesday)).toBe(false);
  });

  it("getPuzzleForDayKey gives every weekday of the SAME week a puzzle, and repeats across weeks", () => {
    const wednesday = new Date(2025, 2, 12);
    const seen = new Set<string>();
    WEEK_DAY_KEYS.forEach((key) => seen.add(getPuzzleForDayKey(key, wednesday).answer));
    expect(seen.size).toBe(WEEK_DAY_KEYS.length);

    // El mismo día de la semana, una semana después, vuelve a dar el
    // mismo puzzle (7 días de diferencia = mismo resto al dividir por 7).
    const nextWednesday = new Date(2025, 2, 19);
    expect(getPuzzleForDayKey("wed", wednesday)).toBe(getPuzzleForDayKey("wed", nextWednesday));
  });

  it("dateKeyForDayKey gives each weekday of the current week its own real calendar date", () => {
    const wednesday = new Date(2025, 2, 12);
    expect(dateKeyForDayKey("wed", wednesday)).toBe("2025-03-12");
    expect(dateKeyForDayKey("mon", wednesday)).toBe("2025-03-10");
    expect(dateKeyForDayKey("fri", wednesday)).toBe("2025-03-14");
  });
});
