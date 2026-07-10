import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { foodCreateSchema } from "@/lib/validation";
import { augmentHealthTags } from "@/lib/healthTags";
import { unauthorized } from "@/lib/apiErrors";
import { rankFoods } from "@/lib/foodRanking";

// GET /api/foods?q=searchterm — shared foods + caller's private customs
export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const recent = searchParams.get("recent") === "1";
  const favorites = searchParams.get("favorites") === "1";

  if (favorites) {
    if (!userId) return unauthorized();
    const rows = await prisma.favoriteFood.findMany({
      where: { userId },
      include: { food: { include: { servings: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(
      rows.map((r) => ({
        ...r.food,
        healthTags: augmentHealthTags(r.food.healthTags, r.food),
        isFavorite: true,
      })),
    );
  }

  if (recent) {
    if (!userId) return unauthorized();
    const items = await prisma.mealItem.findMany({
      where: { meal: { userId } },
      orderBy: { meal: { createdAt: "desc" } },
      take: 50,
      include: { food: { include: { servings: true } } },
    });
    const seen = new Set<string>();
    const foods = [];
    for (const item of items) {
      if (seen.has(item.foodId)) continue;
      // only show if user can access (shared or own)
      if (item.food.userId && item.food.userId !== userId) continue;
      seen.add(item.foodId);
      foods.push({
        ...item.food,
        healthTags: augmentHealthTags(item.food.healthTags, item.food),
      });
      if (foods.length >= 12) break;
    }
    return NextResponse.json(foods);
  }

  const visibility = userId
    ? { OR: [{ userId: null }, { userId }] }
    : { userId: null };

  const foods = await prisma.food.findMany({
    where: q
      ? {
          AND: [
            visibility,
            {
              OR: [
                { name: { contains: q } },
                { nameEn: { contains: q } },
              ],
            },
          ],
        }
      : visibility,
    include: { servings: true },
    take: 50,
  });

  // Rank results for logged-in users with targets set
  let ranked: typeof foods;
  if (userId && q) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyTarget: true, proteinTarget: true, fatTarget: true, carbsTarget: true, sodiumTarget: true, healthConditions: true },
    });
    if (user?.dailyTarget) {
      const scores = await rankFoods(foods, {
        userId,
        dailyTarget: user.dailyTarget,
        proteinTarget: user.proteinTarget,
        fatTarget: user.fatTarget,
        carbsTarget: user.carbsTarget,
        sodiumTarget: user.sodiumTarget,
        healthConditions: user.healthConditions,
      });
      const rankMap = new Map(scores.map(s => [s.foodId, s.score]));
      ranked = [...foods].sort((a, b) => (rankMap.get(b.id) ?? 0) - (rankMap.get(a.id) ?? 0));
    } else {
      ranked = foods;
    }
  } else {
    ranked = foods;
  }

  const top = ranked.slice(0, 20);

  let favoriteIds = new Set<string>();
  if (userId) {
    const favs = await prisma.favoriteFood.findMany({
      where: { userId, foodId: { in: top.map((f) => f.id) } },
      select: { foodId: true },
    });
    favoriteIds = new Set(favs.map((f) => f.foodId));
  }

  const withTags = top.map((food) => ({
    ...food,
    healthTags: augmentHealthTags(food.healthTags, food),
    isFavorite: favoriteIds.has(food.id),
  }));

  return NextResponse.json(withTags);
}

// POST /api/foods - register a private custom food for the signed-in user
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json();
  const parsed = foodCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const { servings, ...foodData } = parsed.data;

  const food = await prisma.food.create({
    data: {
      ...foodData,
      userId: session.user.id,
      isCustom: true,
      servings: { create: servings },
    },
    include: { servings: true },
  });

  return NextResponse.json(
    { ...food, healthTags: augmentHealthTags(food.healthTags, food), isFavorite: false },
    { status: 201 },
  );
}
