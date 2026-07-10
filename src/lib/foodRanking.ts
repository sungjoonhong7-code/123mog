/**
 * Food ranking — content-based scoring for search results.
 *
 * Ranks foods by a weighted combination of:
 *   1. Macro gap fill — how well this food fits remaining daily targets
 *   2. Personal affinity — frequency + recency in user's meal history
 *   3. Health compatibility — penalty for conflicting health conditions
 *
 * Uses only Prisma queries + math — no external deps, runs server-side.
 */

import { prisma } from "@/lib/prisma";
import { localDayRange, toLocalDateKey } from "@/lib/dates";

// ─── Scoring weights ─────────────────────────────────────────────────────────
const MACRO_WEIGHT = 0.45;
const AFFINITY_WEIGHT = 0.35;
const HEALTH_WEIGHT = 0.20;

// ─── Types ───────────────────────────────────────────────────────────────────

interface FoodForRanking {
  id: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  sodiumPer100g: number | null;
}

interface UserContext {
  userId: string;
  dailyTarget: number;
  proteinTarget: number | null;
  fatTarget: number | null;
  carbsTarget: number | null;
  sodiumTarget: number | null;
  healthConditions: string | null;
}

interface FoodScore {
  foodId: string;
  score: number;
  macroScore: number;
  affinityScore: number;
  healthScore: number;
}

// ─── Today's consumed macros ─────────────────────────────────────────────────

async function getTodayMacros(userId: string) {
  const today = toLocalDateKey();
  const { start, end } = localDayRange(today);

  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { items: { select: { totalCalories: true, totalProtein: true, totalFat: true, totalCarbs: true, totalSodium: true } } },
  });

  let calories = 0, protein = 0, fat = 0, carbs = 0, sodium = 0;
  for (const m of meals) {
    for (const item of m.items) {
      calories += item.totalCalories;
      protein += item.totalProtein;
      fat += item.totalFat;
      carbs += item.totalCarbs;
      sodium += item.totalSodium ?? 0;
    }
  }

  return { calories, protein, fat, carbs, sodium };
}

// ─── Macro gap fill score (higher = better fit) ──────────────────────────────

function macroGapScore(
  food: FoodForRanking,
  ctx: UserContext,
  consumed: { calories: number; protein: number; fat: number; carbs: number; sodium: number }
): number {
  // Typical serving: assume 150g for scoring (standard meal portion)
  const grams = 150;
  const factor = grams / 100;

  const remaining = {
    calories: (ctx.dailyTarget) - consumed.calories,
    protein: (ctx.proteinTarget ?? 50) - consumed.protein,
    fat: (ctx.fatTarget ?? 50) - consumed.fat,
    carbs: (ctx.carbsTarget ?? 250) - consumed.carbs,
    sodium: (ctx.sodiumTarget ?? 2300) - consumed.sodium,
  };

  // Score each macro dimension: how many % of the remaining gap does this food fill?
  // Perfect = exactly fills the gap. Penalize both under- and over-filling.
  const calFit = remaining.calories > 0
    ? 1 - Math.abs(1 - (food.caloriesPer100g * factor) / remaining.calories)
    : 0;
  const proFit = remaining.protein > 0
    ? 1 - Math.abs(1 - (food.proteinPer100g * factor) / remaining.protein)
    : 0;
  const fatFit = remaining.fat > 0
    ? 1 - Math.abs(1 - (food.fatPer100g * factor) / remaining.fat)
    : 0;
  const carbFit = remaining.carbs > 0
    ? 1 - Math.abs(1 - (food.carbsPer100g * factor) / remaining.carbs)
    : 0;

  // Average across macros, clamp to [0, 1]
  return Math.max(0, (calFit + proFit + fatFit + carbFit) / 4);
}

// ─── Personal affinity score (history-based) ─────────────────────────────────

async function computeAffinityScores(
  userId: string,
  foodIds: string[]
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  if (foodIds.length === 0) return scores;

  // Count how many times each food appears in user's meals (last 60 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);

  const items = await prisma.mealItem.findMany({
    where: {
      meal: { userId },
      foodId: { in: foodIds },
    },
    select: { foodId: true, meal: { select: { createdAt: true } } },
  });

  // Also check favorites
  const favs = await prisma.favoriteFood.findMany({
    where: { userId, foodId: { in: foodIds } },
    select: { foodId: true },
  });
  const favSet = new Set(favs.map(f => f.foodId));

  // Score: frequency weighted by recency, with favorite boost
  for (const item of items) {
    const age = (Date.now() - item.meal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recency = Math.exp(-age / 14); // half-life of 14 days
    const current = scores.get(item.foodId) || 0;
    scores.set(item.foodId, current + recency);
  }

  // Normalize to [0, 1] and add favorite boost
  const max = Math.max(...scores.values(), 1);
  for (const foodId of foodIds) {
    const raw = scores.get(foodId) || 0;
    const normalized = raw / max;
    const withFav = favSet.has(foodId) ? Math.min(1, normalized + 0.2) : normalized;
    scores.set(foodId, withFav);
  }

  return scores;
}

// ─── Health compatibility score ──────────────────────────────────────────────

function healthCompatibilityScore(
  food: FoodForRanking,
  healthConditions: string | null
): number {
  if (!healthConditions) return 1.0; // no conditions = nothing to penalize

  const conds = healthConditions.toLowerCase();
  let penalty = 0;

  // Hypertension → penalize high sodium foods
  if ((conds.includes("hypertension") || conds.includes("고혈압")) && food.sodiumPer100g != null) {
    if (food.sodiumPer100g > 500) penalty += 0.3;
    else if (food.sodiumPer100g > 200) penalty += 0.15;
  }

  // Diabetes → penalize high carb, reward high protein
  if (conds.includes("diabetes") || conds.includes("당뇨")) {
    if (food.carbsPer100g > 40) penalty += 0.3;
    else if (food.carbsPer100g > 25) penalty += 0.15;
  }

  // High cholesterol → penalize high fat
  if (conds.includes("high_cholesterol") || conds.includes("고지혈") || conds.includes("콜레스테롤")) {
    if (food.fatPer100g > 15) penalty += 0.3;
    else if (food.fatPer100g > 8) penalty += 0.15;
  }

  return Math.max(0, 1 - penalty);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function rankFoods(
  foods: FoodForRanking[],
  ctx: UserContext
): Promise<FoodScore[]> {
  const consumed = await getTodayMacros(ctx.userId);
  const affinityMap = await computeAffinityScores(
    ctx.userId,
    foods.map(f => f.id)
  );

  const scored: FoodScore[] = foods.map(food => {
    const macroScore = macroGapScore(food, ctx, consumed);
    const affinityScore = affinityMap.get(food.id) ?? 0;
    const healthScore = healthCompatibilityScore(food, ctx.healthConditions);

    const score =
      MACRO_WEIGHT * macroScore +
      AFFINITY_WEIGHT * affinityScore +
      HEALTH_WEIGHT * healthScore;

    return {
      foodId: food.id,
      score: Math.round(score * 1000) / 1000,
      macroScore: Math.round(macroScore * 1000) / 1000,
      affinityScore: Math.round(affinityScore * 1000) / 1000,
      healthScore: Math.round(healthScore * 1000) / 1000,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
