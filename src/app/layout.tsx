import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
export const metadata: Metadata = { title: "社内組織図ツール", description: "誰がどの部署で誰にレポートするかを即時可視化" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <Navigation />
        <main className="flex-1 overflow-auto flex flex-col">{children}</main>
      </body>
    </html>
  );
}
