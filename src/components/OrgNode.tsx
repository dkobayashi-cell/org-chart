"use client";
import { useState } from "react";
import type { OrgNode } from "@/app/api/org-tree/route";
const DEPT_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  経営企画部: { bg: "bg-purple-50", border: "border-purple-300", badge: "bg-purple-100 text-purple-700" },
  営業部: { bg: "bg-blue-50", border: "border-blue-300", badge: "bg-blue-100 text-blue-700" },
  開発部: { bg: "bg-green-50", border: "border-green-300", badge: "bg-green-100 text-green-700" },
  管理部: { bg: "bg-orange-50", border: "border-orange-300", badge: "bg-orange-100 text-orange-700" },
};
const DEFAULT_COLOR = { bg: "bg-gray-50", border: "border-gray-300", badge: "bg-gray-100 text-gray-700" };
function getColor(deptName: string | undefined | null) { return deptName ? (DEPT_COLORS[deptName] ?? DEFAULT_COLOR) : DEFAULT_COLOR; }
export default function OrgNodeComponent({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const hasChildren = node.children.length > 0;
  const color = getColor(node.department?.name);
  const isConcurrent = node.concurrentDepartments.length > 0;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`relative border-2 rounded-lg px-4 py-3 w-44 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${color.bg} ${color.border} ${node.isRetired ? "opacity-60" : ""}`} onClick={() => setShowDetail(!showDetail)}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{node.employeeId}</span>
            {isConcurrent && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">兼務</span>}
            {node.isRetired && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">退職</span>}
          </div>
          <div className="font-semibold text-sm text-gray-900 truncate">{node.name}</div>
          {node.position && <div className="text-xs text-gray-500 truncate mt-0.5">{node.position}</div>}
          {node.department && <div className={`mt-1.5 inline-block text-xs px-1.5 py-0.5 rounded ${color.badge}`}>{node.department.name}</div>}
        </div>
        {showDetail && (
          <div className="absolute left-full ml-2 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-60 text-sm">
            <button onClick={e => { e.stopPropagation(); setShowDetail(false); }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
            <div className="font-bold text-base mb-2">{node.name}</div>
            <table className="w-full text-xs"><tbody>
              <tr><td className="text-gray-500 pr-2 py-0.5">社員番号</td><td>{node.employeeId}</td></tr>
              {node.nameKana && <tr><td className="text-gray-500 pr-2 py-0.5">カナ</td><td>{node.nameKana}</td></tr>}
              {node.position && <tr><td className="text-gray-500 pr-2 py-0.5">役職</td><td>{node.position}</td></tr>}
              {node.email && <tr><td className="text-gray-500 pr-2 py-0.5">メール</td><td className="break-all">{node.email}</td></tr>}
              {node.department && <tr><td className="text-gray-500 pr-2 py-0.5">部署</td><td>{node.department.name}</td></tr>}
              {node.concurrentDepartments.length > 0 && <tr><td className="text-gray-500 pr-2 py-0.5 align-top">兼務</td><td>{node.concurrentDepartments.map(cd => cd.department.name).join(", ")}</td></tr>}
              {node.isRetired && <tr><td className="text-gray-500 pr-2 py-0.5">ステータス</td><td className="text-red-600">退職済み</td></tr>}
            </tbody></table>
          </div>
        )}
      </div>
      {hasChildren && (
        <button onClick={() => setCollapsed(!collapsed)} className="mt-1 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center">
          {collapsed ? "+" : "−"}
        </button>
      )}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center mt-1">
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-start gap-2">
            {node.children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {node.children.length > 1 && <div className="w-full h-px bg-gray-300 relative"><div className="absolute left-1/2 -translate-x-1/2 w-px h-3 bg-gray-300" /></div>}
                {node.children.length === 1 && <div className="w-px h-3 bg-gray-300" />}
                <OrgNodeComponent node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
