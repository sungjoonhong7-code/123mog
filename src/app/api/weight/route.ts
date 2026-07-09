import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { weightLogSchema } from "@/lib/validation";
import { toLocalDateKey } from "@/lib/dates";
import { unauthorized } from "@/lib/apiErrors";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") || 30), 90);
  const logs = await prisma.weightLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
  });
  return NextResponse.json(logs);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json();
  const parsed = weightLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const date = parsed.data.date || toLocalDateKey();
  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, weight: parsed.data.weight },
    update: { weight: parsed.data.weight },
  });

  // keep profile weight in sync with latest log if logging today
  if (date === toLocalDateKey()) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { weight: parsed.data.weight },
    });
  }

  return NextResponse.json(log);
}
