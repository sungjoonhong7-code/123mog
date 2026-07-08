import { describe, expect, it } from "vitest";
import { sodiumTagFor, withSodiumTag } from "@/lib/healthTags";

describe("sodiumTagFor", () => {
  it("returns null for unknown sodium", () => {
    expect(sodiumTagFor(null)).toBeNull();
    expect(sodiumTagFor(undefined)).toBeNull();
  });

  it("tags low sodium as good", () => {
    expect(sodiumTagFor(50)).toBe("sodium_good");
    expect(sodiumTagFor(120)).toBe("sodium_good");
  });

  it("tags high sodium as bad", () => {
    expect(sodiumTagFor(600)).toBe("sodium_bad");
    expect(sodiumTagFor(1500)).toBe("sodium_bad");
  });

  it("tags mid-range sodium as neutral", () => {
    expect(sodiumTagFor(300)).toBe("sodium_neutral");
  });
});

describe("withSodiumTag", () => {
  it("appends the sodium tag to existing tags", () => {
    expect(withSodiumTag("ldl_good", 700)).toBe("ldl_good,sodium_bad");
  });

  it("returns just the sodium tag when there are no existing tags", () => {
    expect(withSodiumTag(null, 50)).toBe("sodium_good");
  });

  it("leaves tags unchanged when sodium is unknown", () => {
    expect(withSodiumTag("ldl_good", null)).toBe("ldl_good");
    expect(withSodiumTag(null, null)).toBeNull();
  });
});
