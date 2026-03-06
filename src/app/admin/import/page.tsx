"use client";
import { useState, useRef } from "react";
type ImportResult = { success: number; errors: { row: number; message: string }[] };
export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImport = async () => {
    if (!file) { setError("ファイルを選択してください"); return; }
    setError(""); setResult(null); setImporting(true);
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error??"インポートに失敗しました"); return; }
      setResult(data);
    } catch { setError("通信エラーが発生しました"); } finally { setImporting(false); }
  };
  const csvSpec = [
    { col: "社員番号", required: true, desc: "一意の社員番号 (例: E001)" },
    { col: "氏名", required: true, desc: "フルネーム (例: 山田 太郎)" },
    { col: "氏名カナ", required: false, desc: "カタカナ読み" },
    { col: "メール", required: false, desc: "メールアドレス" },
    { col: "役職", required: false, desc: "役職名 (例: 課長)" },
    { col: "部署名", required: false, desc: "部署名。未存在の場合は自動作成" },
    { col: "上司社員番号", required: false, desc: "上司の社員番号。同CSVに含まれていれば紐付け" },
    { col: "入社日", required: false, desc: "YYYY-MM-DD 形式 (例: 2020-04-01)" },
    { col: "退職", required: false, desc: "「退職」「1」「true」で退職扱い" },
  ];
  return (
    <div className="flex flex-col flex-1">
      <div className="px-6 py-4 bg-white border-b border-gray-200"><h1 className="text-xl font-bold text-gray-900">CSV取込 / 出力</h1><p className="text-sm text-gray-500 mt-0.5">社員データのインポート・エクスポートができます</p></div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">📥 CSVインポート</h2>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file?"border-blue-400 bg-blue-50":"border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]??null)} className="hidden" />
              {file ? (
                <div><div className="text-blue-600 font-medium">{file.name}</div><div className="text-sm text-gray-500 mt-1">{(file.size/1024).toFixed(1)} KB</div><button onClick={e=>{e.stopPropagation();setFile(null);if(fileInputRef.current)fileInputRef.current.value="";}} className="mt-2 text-xs text-red-500 hover:text-red-700">ファイルを解除</button></div>
              ) : (
                <div><div className="text-3xl mb-2">📄</div><div className="text-sm text-gray-600">クリックしてCSVファイルを選択</div><div className="text-xs text-gray-400 mt-1">.csv ファイルのみ対応</div></div>
              )}
            </div>
            {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
            <button onClick={handleImport} disabled={!file||importing} className="mt-4 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{importing?"インポート中...":"インポート実行"}</button>
            {result && (
              <div className="mt-4">
                <div className={`rounded-lg p-3 text-sm ${result.errors.length===0?"bg-green-50 border border-green-200":"bg-yellow-50 border border-yellow-200"}`}><div className="font-medium">✅ 成功: {result.success}件{result.errors.length>0&&` / ⚠️ エラー: ${result.errors.length}件`}</div></div>
                {result.errors.length>0 && <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto"><div className="text-xs font-medium text-red-700 mb-1">エラー詳細:</div>{result.errors.map((e,i)=><div key={i} className="text-xs text-red-600">行 {e.row}: {e.message}</div>)}</div>}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">📤 CSVエクスポート</h2>
            <p className="text-sm text-gray-500 mb-4">現在の社員データをCSV形式でダウンロードします。</p>
            <div className="space-y-3">
              <button onClick={() => { window.location.href="/api/export"; }} className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">在籍社員をエクスポート</button>
              <button onClick={() => { window.location.href="/api/export?includeRetired=true"; }} className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">全社員をエクスポート (退職者含む)</button>
            </div>
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">エクスポートされるCSVはExcelでの文字化けを防ぐため UTF-8 BOM 付きで出力されます。</div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-5xl">
          <h2 className="text-base font-bold text-gray-900 mb-4">📋 CSV仕様</h2>
          <p className="text-sm text-gray-500 mb-4">1行目はヘッダー行です。文字コードは UTF-8 または UTF-8 BOM に対応。</p>
          <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-4 py-2.5 font-medium text-gray-600">列名</th><th className="text-center px-4 py-2.5 font-medium text-gray-600 w-20">必須</th><th className="text-left px-4 py-2.5 font-medium text-gray-600">説明</th></tr></thead>
          <tbody>{csvSpec.map(row=><tr key={row.col} className="border-b border-gray-100"><td className="px-4 py-2.5 font-mono text-gray-800">{row.col}</td><td className="px-4 py-2.5 text-center">{row.required?<span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded">必須</span>:<span className="text-gray-400 text-xs">任意</span>}</td><td className="px-4 py-2.5 text-gray-600">{row.desc}</td></tr>)}</tbody></table>
          <div className="mt-4 bg-gray-800 rounded-lg p-4 text-xs font-mono text-gray-300">
            <div className="text-gray-500 mb-1"># サンプルCSV</div>
            <div>社員番号,氏名,氏名カナ,メール,役職,部署名,上司社員番号,入社日,退職</div>
            <div>E001,山田 太郎,ヤマダ タロウ,yamada@example.co.jp,代表取締役,経営企画部,,2010-04-01,</div>
            <div>E002,鈴木 花子,スズキ ハナコ,suzuki@example.co.jp,部長,営業部,E001,2012-04-01,</div>
          </div>
        </div>
      </div>
    </div>
  );
}
