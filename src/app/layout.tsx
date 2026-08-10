import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://viewdding.com"),
  title: { default: "Viewdding | 지역별 웨딩홀 찾기", template: "%s | Viewdding" },
  description: "서울부터 광주·천안아산·울산·청주·제주·전주까지 전국 주요 지역 웨딩홀을 지역과 예식 조건별로 찾아보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6806384432816233"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppHeader />
        <main className="page-shell">{children}</main>
        <footer className="site-footer">© 2026 Viewding. All rights reserved.</footer>
        <BottomNav />
      </body>
    </html>
  );
}
