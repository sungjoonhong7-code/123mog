import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addDaysToKey, localDayRange, toLocalDateKey } from "@/lib/dates";
import { unauthorized } from "@/lib/apiErrors";

/** Streak + weekly calorie goal progress for dashboard widgets */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const today = toLocalDateKey();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dailyTarget: true, healthConditions: true, sodiumTarget: true },
  });
  const target = user?.dailyTarget ?? 2000;

  // look back 60 days for streak
  const startKey = addDaysToKey(today, -59);
  const { start } = localDayRange(startKey);
  const { end } = localDayRange(today);

  const meals = await prisma.meal.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    include: { items: true },
  });

  const byDate = new Map<string, number>();
  for (const meal of meals) {
    const key = toLocalDateKey(meal.date);
    const cals = meal.items.reduce((s, i) => s + i.totalCalories, 0);
    byDate.set(key, (byDate.get(key) ?? 0) + cals);
  }

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const key = addDaysToKey(today, -i);
    if ((byDate.get(key) ?? 0) > 0) streak += 1;
    else break;
  }

  // last 7 days goal hit rate
  let daysWithLog = 0;
  let daysHit = 0;
  for (let i = 0; i < 7; i++) {
    const key = addDaysToKey(today, -i);
    const c = byDate.get(key);
    if (c != null && c > 0) {
      daysWithLog += 1;
      if (c <= target * 1.05) daysHit += 1; // within 5% over still "ok"
    }
  }

  return NextResponse.json({
    streak,
    weekDaysLogged: daysWithLog,
    weekDaysOnTarget: daysHit,
    dailyTarget: target,
    healthConditions: user?.healthConditions ?? "",
    sodiumTarget: user?.sodiumTarget ?? 2300,
  });
}
