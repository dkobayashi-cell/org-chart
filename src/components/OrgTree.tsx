"use client";
import { useEffect, useState, useCallback } from "react";
import OrgNodeComponent from "./OrgNode";
import type { OrgNode } from "@/app/api/org-tree/route";
type Department = { id: number; name: string };
export default function OrgTree() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [includeRetired, setIncludeRetired] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.set("departmentId", String(selectedDept));
      if (includeRetired) params.set("includeRetired", "true");
      const res = await fetch(`/api/org-tree?${params}`);
      setTree(await res.json());
    } finally { setLoading(false); }
  }, [selectedDept, includeRetired]);
  useEffect(() => { fetch("/api/departments").then(r=>r.json()).then(setDepartments); }, []);
  useEffect(() => { fetchTree(); }, [fetchTree]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSelectedDept(null)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedDept === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>全部署</button>
          {departments.map(dept => (
            <button key={dept.id} onClick={() => setSelectedDept(dept.id)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedDept === dept.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{dept.name}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 ml-auto cursor-pointer">
          <input type="checkbox" checked={includeRetired} onChange={e => setIncludeRetired(e.target.checked)} className="w-4 h-4" />退職者を含む
        </label>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">読み込み中...</div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400"><div className="text-4xl mb-3">🌳</div><p>表示する社員がいません</p></div>
        ) : (
          <div className="flex gap-8 items-start flex-wrap">{tree.map(root => <OrgNodeComponent key={root.id} node={root} />)}</div>
        )}
      </div>
      <div className="px-6 py-2 bg-white border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
        <span className="font-medium">部署色:</span>
        {[{name:"経営企画部",cls:"bg-purple-100 text-purple-700"},{name:"営業部",cls:"bg-blue-100 text-blue-700"},{name:"開発部",cls:"bg-green-100 text-green-700"},{name:"管理部",cls:"bg-orange-100 text-orange-700"}].map(d => (
          <span key={d.name} className={`px-2 py-0.5 rounded ${d.cls}`}>{d.name}</span>
        ))}
        <span className="ml-2">ノードをクリックすると詳細表示</span>
      </div>
    </div>
  );
}
