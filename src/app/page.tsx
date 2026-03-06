import OrgTree from "@/components/OrgTree";
export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">組織図</h1>
        <p className="text-sm text-gray-500 mt-0.5">部署・レポートラインを確認できます</p>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col"><OrgTree /></div>
    </div>
  );
}
