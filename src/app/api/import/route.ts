import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ファイルが指定されていません" }, { status: 400 });
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return NextResponse.json({ error: "CSVにデータがありません" }, { status: 400 });
  const results: { success: number; errors: { row: number; message: string }[] } = { success: 0, errors: [] };
  const departmentNames = Array.from(new Set(rows.map(r => r.部署名).filter(Boolean)));
  for (const name of departmentNames) {
    const existing = await prisma.department.findUnique({ where: { name } });
    if (!existing) { const maxSort = await prisma.department.aggregate({ _max: { sortOrder: true } }); await prisma.department.create({ data: { name, sortOrder: (maxSort._max.sortOrder ?? 0) + 1 } }); }
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]; const rowNum = i + 2;
    if (!row.社員番号?.trim()) { results.errors.push({ row: rowNum, message: "社員番号が空です" }); continue; }
    if (!row.氏名?.trim()) { results.errors.push({ row: rowNum, message: `行${rowNum}: 氏名が空です` }); continue; }
    const dept = row.部署名 ? await prisma.department.findUnique({ where: { name: row.部署名 } }) : null;
    try {
      await prisma.employee.upsert({
        where: { employeeId: row.社員番号.trim() },
        update: { name: row.氏名.trim(), nameKana: row.氏名カナ?.trim() || null, email: row.メール?.trim() || null, position: row.役職?.trim() || null, departmentId: dept?.id ?? null, hiredAt: row.入社日 ? new Date(row.入社日) : null, isRetired: row.退職==="1"||row.退職==="true"||row.退職==="退職" },
        create: { employeeId: row.社員番号.trim(), name: row.氏名.trim(), nameKana: row.氏名カナ?.trim() || null, email: row.メール?.trim() || null, position: row.役職?.trim() || null, departmentId: dept?.id ?? null, hiredAt: row.入社日 ? new Date(row.入社日) : null, isRetired: row.退職==="1"||row.退職==="true"||row.退職==="退職" },
      });
    } catch { results.errors.push({ row: rowNum, message: `行${rowNum}: データ保存に失敗しました` }); continue; }
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.上司社員番号?.trim()) continue;
    const employee = await prisma.employee.findUnique({ where: { employeeId: row.社員番号.trim() } });
    const manager = await prisma.employee.findUnique({ where: { employeeId: row.上司社員番号.trim() } });
    if (employee && manager) { await prisma.employee.update({ where: { id: employee.id }, data: { managerId: manager.id } }); results.success++; } else if (employee) { results.success++; }
  }
  return NextResponse.json(results);
}
