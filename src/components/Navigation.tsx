"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const navItems = [
  { href: "/", label: "組織図", icon: "🌳" },
  { href: "/admin/employees", label: "社員管理", icon: "👥" },
  { href: "/admin/departments", label: "部署管理", icon: "🏢" },
  { href: "/admin/import", label: "CSV取込/出力", icon: "📂" },
];
export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="w-52 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-base font-bold leading-tight">社内組織図ツール</h1>
        <p className="text-xs text-gray-400 mt-1">OrgChart</p>
      </div>
      <ul className="flex-1 py-4">
        {navItems.map(item => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">v0.1.0</div>
    </nav>
  );
}
