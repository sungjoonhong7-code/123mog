import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return jsonError("unauthorized", 401);
}

export function forbidden() {
  return jsonError("forbidden", 403);
}

export function tooMany() {
  return jsonError("too_many", 429);
}
