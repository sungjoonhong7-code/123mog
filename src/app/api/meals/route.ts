import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { computeMealItems } from "@/lib/mealItems";
import { mealCreateSchema } from "@/lib/validation";
import { augmentHealthTags } from "@/lib/healthTags";
import { isValidDateKey, localDayRange, parseLocalDateKey, toLocalDateKey } from "@/lib/dates";
import { unauthorized } from "@/lib/apiErrors";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!isValidDateKey(dateStr)) {
    return NextResponse.json({ error: "date query parameter is required (yyyy-MM-dd)" }, { status: 400 });
  }

  const { start, end } = localDayRange(dateStr);

  const meals = await prisma.meal.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    include: {
      items: { include: { food: { select: { name: true, nameEn: true, healthTags: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const grouped = meals.map((meal) => ({
    id: meal.id,
    mealType: meal.mealType,
    date: toLocalDateKey(meal.date),
    totalCalories: meal.items.reduce((sum, item) => sum + item.totalCalories, 0),
    totalProtein: meal.items.reduce((sum, item) => sum + item.totalProtein, 0),
    totalFat: meal.items.reduce((sum, item) => sum + item.totalFat, 0),
    totalCarbs: meal.items.reduce((sum, item) => sum + item.totalCarbs, 0),
    totalSodium: meal.items.some((item) => item.totalSodium != null)
      ? meal.items.reduce((sum, item) => sum + (item.totalSodium ?? 0), 0)
      : null,
    items: meal.items.map((item) => ({
      id: item.id,
      foodId: item.foodId,
      foodName: item.food.name,
      foodNameEn: item.food.nameEn,
      healthTags: augmentHealthTags(item.food.healthTags, {
        carbsPer100g: item.totalGrams > 0 ? (item.totalCarbs / item.totalGrams) * 100 : null,
        fatPer100g: item.totalGrams > 0 ? (item.totalFat / item.totalGrams) * 100 : null,
        sodiumPer100g:
          item.totalGrams > 0 && item.totalSodium != null
            ? (item.totalSodium / item.totalGrams) * 100
            : null,
      }),
      quantity: item.quantity,
      unitName: item.unitName,
      totalCalories: item.totalCalories,
      totalProtein: item.totalProtein,
      totalFat: item.totalFat,
      totalCarbs: item.totalCarbs,
      totalSodium: item.totalSodium,
    })),
  }));

  return NextResponse.json(grouped);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const parsed = mealCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }
    const { mealType, date, items } = parsed.data;

    const mealItems = await computeMealItems(items);
    const mealDate = date ? parseLocalDateKey(date) : parseLocalDateKey(toLocalDateKey());

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        mealType,
        date: mealDate,
        items: {
          create: mealItems,
        },
      },
      include: {
        items: {
          include: { food: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Create meal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
