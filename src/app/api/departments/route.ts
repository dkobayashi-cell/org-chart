export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const departments = await prisma.department.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { employees: { where: { isRetired: false } } } } } });
  return NextResponse.json(departments);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, sortOrder } = body;
  if (!name || typeof name !== "string" || name.trim() === "") return NextResponse.json({ error: "部署名は必須です" }, { status: 400 });
  const existing = await prisma.department.findUnique({ where: { name: name.trim() } });
  if (existing) return NextResponse.json({ error: "同名の部署が既に存在します" }, { status: 409 });
  const maxSort = await prisma.department.aggregate({ _max: { sortOrder: true } });
  const nextSort = (maxSort._max.sortOrder ?? 0) + 1;
  const dept = await prisma.department.create({ data: { name: name.trim(), description: description?.trim() || null, sortOrder: sortOrder ?? nextSort } });
  return NextResponse.json(dept, { status: 201 });
}
