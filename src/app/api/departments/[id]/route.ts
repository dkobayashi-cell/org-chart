export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const dept = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { employees: true } } } });
  if (!dept) return NextResponse.json({ error: "部署が見つかりません" }, { status: 404 });
  return NextResponse.json(dept);
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const body = await req.json();
  const { name, description, sortOrder } = body;
  if (!name || typeof name !== "string" || name.trim() === "") return NextResponse.json({ error: "部署名は必須です" }, { status: 400 });
  const existing = await prisma.department.findFirst({ where: { name: name.trim(), NOT: { id } } });
  if (existing) return NextResponse.json({ error: "同名の部署が既に存在します" }, { status: 409 });
  const dept = await prisma.department.update({ where: { id }, data: { name: name.trim(), description: description?.trim() ?? null, ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}) } });
  return NextResponse.json(dept);
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const employeeCount = await prisma.employee.count({ where: { departmentId: id, isRetired: false } });
  if (employeeCount > 0) return NextResponse.json({ error: `在籍社員が${employeeCount}名います。先に社員の部署を変更してください。` }, { status: 409 });
  await prisma.department.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
