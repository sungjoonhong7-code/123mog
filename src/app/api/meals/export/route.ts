import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/meals/export - download the signed-in user's full meal history as CSV
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meals = await prisma.meal.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { food: { select: { name: true } } } } },
    orderBy: { date: "asc" },
  });

  const header = ["date", "mealType", "food", "quantity", "unit", "calories", "protein_g", "fat_g", "carbs_g", "sodium_mg"];
  const rows = meals.flatMap((meal) =>
    meal.items.map((item) => [
      format(meal.date, "yyyy-MM-dd"),
      meal.mealType,
      item.food.name,
      item.quantity,
      item.unitName,
      item.totalCalories,
      item.totalProtein,
      item.totalFat,
      item.totalCarbs,
      item.totalSodium ?? "",
    ])
  );

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="123mog-meals.csv"`,
    },
  });
}
