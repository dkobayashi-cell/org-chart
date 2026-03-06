import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("シードデータを投入します...");
  const departments = await Promise.all([
    prisma.department.upsert({ where: { name: "経営企画部" }, update: {}, create: { name: "経営企画部", description: "全社戦略・経営計画の立案", sortOrder: 1 } }),
    prisma.department.upsert({ where: { name: "営業部" }, update: {}, create: { name: "営業部", description: "国内外の営業活動", sortOrder: 2 } }),
    prisma.department.upsert({ where: { name: "開発部" }, update: {}, create: { name: "開発部", description: "製品・システムの開発", sortOrder: 3 } }),
    prisma.department.upsert({ where: { name: "管理部" }, update: {}, create: { name: "管理部", description: "人事・総務・経理", sortOrder: 4 } }),
  ]);
  const [deptKikaku, deptEigyou, deptKaihatsu, deptKanri] = departments;
  const yamada = await prisma.employee.upsert({ where: { employeeId: "E001" }, update: {}, create: { employeeId: "E001", name: "山田 太郎", nameKana: "ヤマダ タロウ", email: "yamada@example.co.jp", position: "代表取締役", departmentId: deptKikaku.id, hiredAt: new Date("2010-04-01") } });
  const suzuki = await prisma.employee.upsert({ where: { employeeId: "E002" }, update: {}, create: { employeeId: "E002", name: "鈴木 花子", nameKana: "スズキ ハナコ", email: "suzuki@example.co.jp", position: "営業部長", departmentId: deptEigyou.id, managerId: yamada.id, hiredAt: new Date("2012-04-01") } });
  const tanaka = await prisma.employee.upsert({ where: { employeeId: "E003" }, update: {}, create: { employeeId: "E003", name: "田中 一郎", nameKana: "タナカ イチロウ", email: "tanaka@example.co.jp", position: "開発部長", departmentId: deptKaihatsu.id, managerId: yamada.id, hiredAt: new Date("2011-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E004" }, update: {}, create: { employeeId: "E004", name: "佐藤 美咲", nameKana: "サトウ ミサキ", email: "sato@example.co.jp", position: "管理部長", departmentId: deptKanri.id, managerId: yamada.id, hiredAt: new Date("2013-04-01") } });
  const ito = await prisma.employee.upsert({ where: { employeeId: "E005" }, update: {}, create: { employeeId: "E005", name: "伊藤 健二", nameKana: "イトウ ケンジ", email: "ito@example.co.jp", position: "営業課長", departmentId: deptEigyou.id, managerId: suzuki.id, hiredAt: new Date("2015-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E006" }, update: {}, create: { employeeId: "E006", name: "渡辺 さくら", nameKana: "ワタナベ サクラ", email: "watanabe@example.co.jp", position: "営業主任", departmentId: deptEigyou.id, managerId: ito.id, hiredAt: new Date("2018-04-01") } });
  const takahashi = await prisma.employee.upsert({ where: { employeeId: "E007" }, update: {}, create: { employeeId: "E007", name: "高橋 雄介", nameKana: "タカハシ ユウスケ", email: "takahashi@example.co.jp", position: "シニアエンジニア", departmentId: deptKaihatsu.id, managerId: tanaka.id, hiredAt: new Date("2016-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E008" }, update: {}, create: { employeeId: "E008", name: "中村 由美", nameKana: "ナカムラ ユミ", email: "nakamura@example.co.jp", position: "エンジニア", departmentId: deptKaihatsu.id, managerId: takahashi.id, hiredAt: new Date("2020-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E009" }, update: {}, create: { employeeId: "E009", name: "小林 勇気", nameKana: "コバヤシ ユウキ", email: "kobayashi@example.co.jp", position: "エンジニア", departmentId: deptKaihatsu.id, managerId: takahashi.id, hiredAt: new Date("2021-04-01") } });
  const sato4 = await prisma.employee.findUnique({ where: { employeeId: "E004" } });
  await prisma.employee.upsert({ where: { employeeId: "E010" }, update: {}, create: { employeeId: "E010", name: "加藤 奈緒", nameKana: "カトウ ナオ", email: "kato@example.co.jp", position: "管理主任", departmentId: deptKanri.id, managerId: sato4!.id, hiredAt: new Date("2019-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E011" }, update: {}, create: { employeeId: "E011", name: "吉田 誠", nameKana: "ヨシダ マコト", email: "yoshida@example.co.jp", position: "営業担当", departmentId: deptEigyou.id, managerId: ito.id, hiredAt: new Date("2022-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E012" }, update: {}, create: { employeeId: "E012", name: "山口 明子", nameKana: "ヤマグチ アキコ", email: "yamaguchi@example.co.jp", position: "総務担当", departmentId: deptKanri.id, managerId: sato4!.id, hiredAt: new Date("2017-04-01") } });
  await prisma.employee.upsert({ where: { employeeId: "E013" }, update: {}, create: { employeeId: "E013", name: "松本 浩二", nameKana: "マツモト コウジ", email: "matsumoto@example.co.jp", position: "エンジニア", departmentId: deptKaihatsu.id, managerId: tanaka.id, isRetired: true, retiredAt: new Date("2023-09-30"), hiredAt: new Date("2014-04-01") } });
  await prisma.employeeDepartment.upsert({ where: { employeeId_departmentId: { employeeId: takahashi.id, departmentId: deptKikaku.id } }, update: {}, create: { employeeId: takahashi.id, departmentId: deptKikaku.id } });
  console.log("シードデータの投入が完了しました。部署:4件 社員:13件 兼務:1件");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
