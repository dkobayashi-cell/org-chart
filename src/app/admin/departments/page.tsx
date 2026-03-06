"use client";
import { useEffect, useState, useCallback } from "react";
import DepartmentForm from "@/components/DepartmentForm";
type Department = { id: number; name: string; description: string | null; sortOrder: number; _count: { employees: number } };
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | undefined>();
  const [deleteError, setDeleteError] = useState("");
  const load = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/departments"); setDepartments(await res.json()); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const handleDelete = async (dept: Department) => {
    if (!confirm(`「${dept.name}」を削除しますか？`)) return;
    setDeleteError("");
    const res = await fetch(`/api/departments/${dept.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error); return; }
    load();
  };
  const handleMove = async (dept: Department, direction: "up" | "down") => {
    const idx = departments.findIndex(d => d.id === dept.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= departments.length) return;
    const swap = departments[swapIdx];
    await Promise.all([
      fetch(`/api/departments/${dept.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: dept.name, description: dept.description, sortOrder: swap.sortOrder }) }),
      fetch(`/api/departments/${swap.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: swap.name, description: swap.description, sortOrder: dept.sortOrder }) }),
    ]);
    load();
  };
  return (
    <div className="flex flex-col flex-1">
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">部署管理</h1><p className="text-sm text-gray-500 mt-0.5">部署の追加・編集・削除・並び替えができます</p></div>
        <button onClick={() => { setEditTarget(undefined); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ 部署を追加</button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {deleteError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between"><span>{deleteError}</span><button onClick={() => setDeleteError("")} className="ml-4 text-red-500">✕</button></div>}
        {loading ? <div className="text-center text-gray-400 py-12">読み込み中...</div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-4 py-3 font-medium text-gray-600 w-16">順番</th><th className="text-left px-4 py-3 font-medium text-gray-600">部署名</th><th className="text-left px-4 py-3 font-medium text-gray-600">説明</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-20">在籍数</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-32">並び替え</th><th className="text-center px-4 py-3 font-medium text-gray-600 w-28">操作</th></tr></thead>
              <tbody>
                {departments.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">部署がありません</td></tr> : departments.map((dept, idx) => (
                  <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-center">{dept.sortOrder}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                    <td className="px-4 py-3 text-gray-500">{dept.description ?? "-"}</td>
                    <td className="px-4 py-3 text-center"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{dept._count.employees}名</span></td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => handleMove(dept,"up")} disabled={idx===0} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-30">↑</button><button onClick={() => handleMove(dept,"down")} disabled={idx===departments.length-1} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-30">↓</button></div></td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-2"><button onClick={() => { setEditTarget(dept); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50">編集</button><button onClick={() => handleDelete(dept)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50">削除</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && <DepartmentForm department={editTarget} onSave={load} onClose={() => { setShowForm(false); setEditTarget(undefined); }} />}
    </div>
  );
}
