export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const employeeInclude = {
  department: true,
  manager: { select: { id: true, employeeId: true, name: true, position: true } },
  concurrentDepartments: { include: { department: true } },
  _count: { select: { subordinates: true } },
};
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const departmentId = searchParams.get("departmentId");
  const includeRetired = searchParams.get("includeRetired") === "true";
  const employees = await prisma.employee.findMany({
    where: {
      ...(search ? { OR: [{ name: { contains: search } }, { nameKana: { contains: search } }, { employeeId: { contains: search } }, { position: { contains: search } }, { email: { contains: search } }] } : {}),
      ...(departmentId ? { departmentId: parseInt(departmentId) } : {}),
      ...(!includeRetired ? { isRetired: false } : {}),
    },
    include: employeeInclude,
    orderBy: [{ departmentId: "asc" }, { employeeId: "asc" }],
  });
  return NextResponse.json(employees);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { employeeId, name, nameKana, email, position, departmentId, managerId, hiredAt, concurrentDepartmentIds } = body;
  if (!employeeId || !employeeId.trim()) return NextResponse.json({ error: "社員番号は必須です" }, { status: 400 });
  if (!name || !name.trim()) return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
  const existing = await prisma.employee.findUnique({ where: { employeeId: employeeId.trim() } });
  if (existing) return NextResponse.json({ error: "この社員番号は既に使用されています" }, { status: 409 });
  if (managerId) { const manager = await prisma.employee.findUnique({ where: { id: managerId } }); if (!manager) return NextResponse.json({ error: "指定した上司が存在しません" }, { status: 400 }); }
  const employee = await prisma.employee.create({
    data: {
      employeeId: employeeId.trim(), name: name.trim(), nameKana: nameKana?.trim() || null, email: email?.trim() || null, position: position?.trim() || null,
      departmentId: departmentId ? Number(departmentId) : null, managerId: managerId ? Number(managerId) : null, hiredAt: hiredAt ? new Date(hiredAt) : null,
      concurrentDepartments: concurrentDepartmentIds?.length ? { create: concurrentDepartmentIds.map((dId: number) => ({ departmentId: dId })) } : undefined,
    },
    include: employeeInclude,
  });
  return NextResponse.json(employee, { status: 201 });
}
