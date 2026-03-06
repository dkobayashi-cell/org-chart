export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCsv, CsvRow } from "@/lib/csv";
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const includeRetired = searchParams.get("includeRetired") === "true";
  const employees = await prisma.employee.findMany({
    where: { ...(!includeRetired ? { isRetired: false } : {}) },
    include: { department: true, manager: { select: { employeeId: true } } },
    orderBy: [{ departmentId: "asc" }, { employeeId: "asc" }],
  });
  const rows: CsvRow[] = employees.map(emp => ({ 社員番号: emp.employeeId, 氏名: emp.name, 氏名カナ: emp.nameKana??"", メール: emp.email??"", 役職: emp.position??"", 部署名: emp.department?.name??"", 上司社員番号: emp.manager?.employeeId??"", 入社日: emp.hiredAt?emp.hiredAt.toISOString().split("T")[0]:"", 退職: emp.isRetired?"退職":"" }));
  const csv = generateCsv(rows);
  return new NextResponse("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="employees_${new Date().toISOString().split("T")[0]}.csv"` } });
}
