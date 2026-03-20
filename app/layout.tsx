import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIS Generator",
  description: "Brand Identity System 자동 생성기",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#121212] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
