import { describe, expect, it } from "vitest";
import {
  toLocalDateKey,
  parseLocalDateKey,
  localDayRange,
  addDaysToKey,
  isValidDateKey,
} from "@/lib/dates";

describe("dates", () => {
  it("formats local date keys", () => {
    const d = new Date(2026, 6, 9, 15, 30); // month is 0-indexed
    expect(toLocalDateKey(d)).toBe("2026-07-09");
  });

  it("parses local date keys at noon", () => {
    const d = parseLocalDateKey("2026-07-09");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(9);
    expect(d.getHours()).toBe(12);
  });

  it("builds inclusive day ranges", () => {
    const { start, end } = localDayRange("2026-07-09");
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(start.getDate()).toBe(9);
    expect(end.getDate()).toBe(9);
  });

  it("adds days across month boundaries", () => {
    expect(addDaysToKey("2026-07-31", 1)).toBe("2026-08-01");
    expect(addDaysToKey("2026-07-01", -1)).toBe("2026-06-30");
  });

  it("validates date keys", () => {
    expect(isValidDateKey("2026-07-09")).toBe(true);
    expect(isValidDateKey("not-a-date")).toBe(false);
    expect(isValidDateKey(null)).toBe(false);
  });
});
