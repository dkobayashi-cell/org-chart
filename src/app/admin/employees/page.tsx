"use client";
import { useEffect, useState, useCallback } from "react";
import EmployeeForm from "@/components/EmployeeForm";
type Department = { id: number; name: string };
type Employee = { id: number; employeeId: string; name: string; nameKana: string | null; email: string | null; position: string | null; departmentId: number | null; managerId: number | null; isRetired: boolean; hiredAt: string | null; retiredAt: string | null; department: { id: number; name: string } | null; manager: { id: number; employeeId: string; name: string; position: string | null } | null; concurrentDepartments: { department: { id: number; name: string } }[]; _count: { subordinates: number } };
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [deptFilter, setDeptFilter] = useState(""); const [includeRetired, setIncludeRetired] = useState(false);
  const [showForm, setShowForm] = useState(false); const [editTarget, setEditTarget] = useState<Employee | undefined>();
  const load = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams(); if(search) params.set("search",search); if(deptFilter) params.set("departmentId",deptFilter); if(includeRetired) params.set("includeRetired","true"); setEmployees(await (await fetch(`/api/employees?${params}`)).json()); }
    finally { setLoading(false); }
  }, [search, deptFilter, includeRetired]);
  useEffect(() => { fetch("/api/departments").then(r=>r.json()).then(setDepartments); }, []);
  useEffect(() => { load(); }, [load]);
  const handleDelete = async (emp: Employee) => {
    if (!confirm(`「${emp.name}」を削除しますか？\n※部下の上司設定は解除されます`)) return;
    const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
    if (res.ok) load();
  };
  const handleEdit = (emp: Employee) => {
    setEditTarget({ ...emp, hiredAt: emp.hiredAt?emp.hiredAt.split("T")[0]:null, retiredAt: emp.retiredAt?emp.retiredAt.split("T")[0]:null,
      // @ts-ignore
      concurrentDepartmentIds: emp.concurrentDepartments.map(cd=>cd.department.id), departmentId: emp.departmentId??undefined, managerId: emp.managerId??undefined } as unknown as Employee);
    setShowForm(true);
  };
  return (
    <div className="flex flex-col flex-1">
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">社員管理</h1><p className="text-sm text-gray-500 mt-0.5">社員の追加・編集・削除ができます</p></div>
        <button onClick={() => { setEditTarget(undefined); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 社員を追加</button>
      </div>
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="氏名・社員番号・役職で検索..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">全部署</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={includeRetired} onChange={e=>setIncludeRetired(e.target.checked)} className="w-4 h-4" />退職者を含む</label>
        <span className="ml-auto text-sm text-gray-400">{employees.length}名</span>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {loading ? <div className="text-center text-gray-400 py-12">読み込み中...</div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-4 py-3 font-medium text-gray-600 w-24">社員番号</th><th className="text-left px-4 py-3 font-medium text-gray-600">氏名</th><th className="text-left px-4 py-3 font-medium text-gray-600">部署</th><th className="text-left px-4 py-3 font-medium text-gray-600">役職</th><th className="text-left px-4 py-3 font-medium text-gray-600">上司</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-16">兼務</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-20">ステータス</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-28">操作</th></tr></thead>
              <tbody>
                {employees.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">該当する社員がいません</td></tr> : employees.map(emp => (
                  <tr key={emp.id} className={`border-b border-gray-100 hover:bg-gray-50 ${emp.isRetired?"opacity-60":""}`}>
                    <td className="px-4 py-3 font-mono text-gray-500">{emp.employeeId}</td>
                    <td className="px-4 py-3"><div className="font-medium text-gray-900">{emp.name}</div>{emp.nameKana && <div className="text-xs text-gray-400">{emp.nameKana}</div>}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.department?.name??"-"}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.position??"-"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.manager?emp.manager.name:"-"}</td>
                    <td className="px-4 py-3 text-center">{emp.concurrentDepartments.length>0?<span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs" title={emp.concurrentDepartments.map(cd=>cd.department.name).join(", ")}>{emp.concurrentDepartments.length}件</span>:"-"}</td>
                    <td className="px-4 py-3 text-center">{emp.isRetired?<span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">退職</span>:<span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">在籍</span>}</td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><button onClick={()=>handleEdit(emp)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50">編集</button><button onClick={()=>handleDelete(emp)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50">削除</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && <EmployeeForm employee={editTarget as Parameters<typeof EmployeeForm>[0]["employee"]} onSave={load} onClose={() => { setShowForm(false); setEditTarget(undefined); }} />}
    </div>
  );
}
