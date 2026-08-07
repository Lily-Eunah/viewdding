import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://viewdding.com"),
  title: { default: "Viewdding | 서울 웨딩홀 찾기", template: "%s | Viewdding" },
  description: "흩어진 서울 웨딩홀 정보를 지역, 웨딩홀 타입, 수용인원과 예식 조건별로 찾아보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><AppHeader /><main className="page-shell">{children}</main><BottomNav /></body></html>;
}
