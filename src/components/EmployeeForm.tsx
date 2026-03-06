"use client";
import { useState, useEffect } from "react";
type Department = { id: number; name: string };
type EmployeeOption = { id: number; employeeId: string; name: string; position: string | null };
type EmployeeInput = { id?: number; employeeId: string; name: string; nameKana: string; email: string; position: string; departmentId: string; managerId: string; hiredAt: string; isRetired: boolean; retiredAt: string; concurrentDepartmentIds: number[] };
type Props = { employee?: Partial<EmployeeInput> & { id?: number }; onSave: () => void; onClose: () => void };
export default function EmployeeForm({ employee, onSave, onClose }: Props) {
  const isEdit = !!employee?.id;
  const [form, setForm] = useState<EmployeeInput>({ employeeId: employee?.employeeId??"", name: employee?.name??"", nameKana: employee?.nameKana??"", email: employee?.email??"", position: employee?.position??"", departmentId: employee?.departmentId?String(employee.departmentId):"", managerId: employee?.managerId?String(employee.managerId):"", hiredAt: employee?.hiredAt??"", isRetired: employee?.isRetired??false, retiredAt: employee?.retiredAt??"", concurrentDepartmentIds: employee?.concurrentDepartmentIds??[] });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/departments").then(r=>r.json()).then(setDepartments);
    fetch("/api/employees?includeRetired=false").then(r=>r.json()).then((data: EmployeeOption[]) => setEmployees(data.filter(e=>e.id!==employee?.id)));
  }, [employee?.id]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.employeeId.trim()) { setError("社員番号は必須です"); return; }
    if (!form.name.trim()) { setError("氏名は必須です"); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/employees/${employee!.id}` : "/api/employees";
      const res = await fetch(url, { method: isEdit?"PUT":"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...form, departmentId: form.departmentId?Number(form.departmentId):null, managerId: form.managerId?Number(form.managerId):null}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error??"保存に失敗しました"); return; }
      onSave(); onClose();
    } catch { setError("通信エラーが発生しました"); } finally { setSaving(false); }
  };
  const toggleConcurrent = (id: number) => setForm(prev => ({ ...prev, concurrentDepartmentIds: prev.concurrentDepartmentIds.includes(id) ? prev.concurrentDepartmentIds.filter(d=>d!==id) : [...prev.concurrentDepartmentIds, id] }));
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4"><h2 className="text-lg font-bold">{isEdit?"社員を編集":"社員を追加"}</h2></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">社員番号 <span className="text-red-500">*</span></label><input type="text" value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: E001" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: 山田 太郎" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名カナ</label><input type="text" value={form.nameKana} onChange={e=>setForm({...form,nameKana:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: ヤマダ タロウ" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">役職</label><input type="text" value={form.position} onChange={e=>setForm({...form,position:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: 課長" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">所属部署</label><select value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- 未選択 --</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">上司</label><select value={form.managerId} onChange={e=>setForm({...form,managerId:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- 未選択 (トップ) --</option>{employees.map(e=><option key={e.id} value={e.id}>{e.employeeId}: {e.name}{e.position?` (${e.position})`:""}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">入社日</label><input type="date" value={form.hiredAt} onChange={e=>setForm({...form,hiredAt:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          {departments.length > 0 && (
            <div><label className="block text-sm font-medium text-gray-700 mb-2">兼務部署</label><div className="flex flex-wrap gap-2">{departments.filter(d=>String(d.id)!==form.departmentId).map(d=><label key={d.id} className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={form.concurrentDepartmentIds.includes(d.id)} onChange={()=>toggleConcurrent(d.id)} className="w-4 h-4" />{d.name}</label>)}</div></div>
          )}
          <div className="border border-gray-200 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"><input type="checkbox" checked={form.isRetired} onChange={e=>setForm({...form,isRetired:e.target.checked})} className="w-4 h-4" />退職済み</label>
            {form.isRetired && <div className="mt-2"><label className="block text-sm text-gray-600 mb-1">退職日</label><input type="date" value={form.retiredAt} onChange={e=>setForm({...form,retiredAt:e.target.value})} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>}
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">{saving?"保存中...":isEdit?"更新":"作成"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
