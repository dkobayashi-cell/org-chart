import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export type OrgNode = {
  id: number; employeeId: string; name: string; nameKana: string | null; position: string | null; email: string | null; isRetired: boolean;
  department: { id: number; name: string } | null;
  concurrentDepartments: { department: { id: number; name: string } }[];
  children: OrgNode[];
};
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const departmentId = searchParams.get("departmentId");
  const includeRetired = searchParams.get("includeRetired") === "true";
  const employees = await prisma.employee.findMany({
    where: { ...(!includeRetired ? { isRetired: false } : {}) },
    include: { department: { select: { id: true, name: true } }, concurrentDepartments: { include: { department: { select: { id: true, name: true } } } } },
    orderBy: { employeeId: "asc" },
  });
  const filteredIds = departmentId
    ? new Set(employees.filter(e => e.departmentId === parseInt(departmentId) || e.concurrentDepartments.some(cd => cd.department.id === parseInt(departmentId))).map(e => e.id))
    : null;
  const map = new Map<number, OrgNode>();
  const roots: OrgNode[] = [];
  for (const emp of employees) {
    if (filteredIds && !filteredIds.has(emp.id)) continue;
    map.set(emp.id, { id: emp.id, employeeId: emp.employeeId, name: emp.name, nameKana: emp.nameKana, position: emp.position, email: emp.email, isRetired: emp.isRetired, department: emp.department, concurrentDepartments: emp.concurrentDepartments, children: [] });
  }
  for (const emp of employees) {
    const node = map.get(emp.id);
    if (!node) continue;
    if (emp.managerId && map.has(emp.managerId)) { map.get(emp.managerId)!.children.push(node); } else { roots.push(node); }
  }
  return NextResponse.json(roots);
}
