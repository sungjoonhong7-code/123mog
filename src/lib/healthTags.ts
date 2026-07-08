// Sodium-based hypertension tag, computed from data rather than manually curated
// (unlike the LDL/sugar tags already hand-tagged on a subset of foods).
const SODIUM_LOW_MG_PER_100G = 120; // "low sodium" - good for hypertension
const SODIUM_HIGH_MG_PER_100G = 600; // "high sodium" - bad for hypertension

export function sodiumTagFor(sodiumPer100g: number | null | undefined): "sodium_good" | "sodium_bad" | "sodium_neutral" | null {
  if (sodiumPer100g == null) return null;
  if (sodiumPer100g <= SODIUM_LOW_MG_PER_100G) return "sodium_good";
  if (sodiumPer100g >= SODIUM_HIGH_MG_PER_100G) return "sodium_bad";
  return "sodium_neutral";
}

// Merges the stored (manually curated) healthTags string with the computed sodium tag.
export function withSodiumTag(healthTags: string | null | undefined, sodiumPer100g: number | null | undefined): string | null {
  const tag = sodiumTagFor(sodiumPer100g);
  if (!tag) return healthTags ?? null;
  return healthTags ? `${healthTags},${tag}` : tag;
}
