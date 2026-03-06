"use client";
import { useState } from "react";
type Department = { id?: number; name: string; description?: string | null; sortOrder?: number };
type Props = { department?: Department; onSave: () => void; onClose: () => void };
export default function DepartmentForm({ department, onSave, onClose }: Props) {
  const isEdit = !!department?.id;
  const [form, setForm] = useState<Department>(department ?? { name: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.name.trim()) { setError("部署名は必須です"); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/departments/${department!.id}` : "/api/departments";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "保存に失敗しました"); return; }
      onSave(); onClose();
    } catch { setError("通信エラーが発生しました"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">{isEdit ? "部署を編集" : "部署を追加"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部署名 <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: 営業部" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input type="text" value={form.description ?? ""} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: 国内外の営業活動" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">{saving ? "保存中..." : isEdit ? "更新" : "作成"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
