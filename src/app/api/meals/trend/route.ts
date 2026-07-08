import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

// GET /api/meals/trend?range=week|month - daily nutrition totals for the signed-in user
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") === "month" ? "month" : "week";
  const days = range === "month" ? 30 : 7;

  const today = new Date();
  const startDate = startOfDay(subDays(today, days - 1));
  const endDate = endOfDay(today);

  const meals = await prisma.meal.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: { items: true },
  });

  const byDate = new Map<string, { calories: number; protein: number; fat: number; carbs: number }>();
  for (const meal of meals) {
    const key = format(meal.date, "yyyy-MM-dd");
    const bucket = byDate.get(key) ?? { calories: 0, protein: 0, fat: 0, carbs: 0 };
    for (const item of meal.items) {
      bucket.calories += item.totalCalories;
      bucket.protein += item.totalProtein;
      bucket.fat += item.totalFat;
      bucket.carbs += item.totalCarbs;
    }
    byDate.set(key, bucket);
  }

  const series = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    const key = format(date, "yyyy-MM-dd");
    const bucket = byDate.get(key) ?? { calories: 0, protein: 0, fat: 0, carbs: 0 };
    return { date: key, ...bucket };
  });

  return NextResponse.json(series);
}
