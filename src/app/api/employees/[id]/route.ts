export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const employeeInclude = {
  department: true,
  manager: { select: { id: true, employeeId: true, name: true, position: true } },
  concurrentDepartments: { include: { department: true } },
  _count: { select: { subordinates: true } },
};
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const employee = await prisma.employee.findUnique({ where: { id }, include: employeeInclude });
  if (!employee) return NextResponse.json({ error: "社員が見つかりません" }, { status: 404 });
  return NextResponse.json(employee);
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const body = await req.json();
  const { employeeId, name, nameKana, email, position, departmentId, managerId, hiredAt, isRetired, retiredAt, concurrentDepartmentIds } = body;
  if (!name || !name.trim()) return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
  if (employeeId) { const dup = await prisma.employee.findFirst({ where: { employeeId: employeeId.trim(), NOT: { id } } }); if (dup) return NextResponse.json({ error: "この社員番号は既に使用されています" }, { status: 409 }); }
  if (managerId && Number(managerId) === id) return NextResponse.json({ error: "自分自身を上司に設定できません" }, { status: 400 });
  await prisma.employeeDepartment.deleteMany({ where: { employeeId: id } });
  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(employeeId ? { employeeId: employeeId.trim() } : {}), name: name.trim(), nameKana: nameKana?.trim() || null, email: email?.trim() || null, position: position?.trim() || null,
      departmentId: departmentId ? Number(departmentId) : null, managerId: managerId ? Number(managerId) : null, hiredAt: hiredAt ? new Date(hiredAt) : null,
      isRetired: isRetired ?? false, retiredAt: isRetired && retiredAt ? new Date(retiredAt) : isRetired ? new Date() : null,
      concurrentDepartments: concurrentDepartmentIds?.length ? { create: concurrentDepartmentIds.map((dId: number) => ({ departmentId: dId })) } : undefined,
    },
    include: employeeInclude,
  });
  return NextResponse.json(employee);
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  await prisma.employee.updateMany({ where: { managerId: id }, data: { managerId: null } });
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
