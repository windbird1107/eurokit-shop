import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EuroKit - 유럽 축구 유니폼 전문점",
  description: "맨유, 레알, 바르사 등 유럽 명문 클럽 공식 유니폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className={`${inter.className} bg-[#080808] text-white min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-[#1e1e1e] mt-20 py-10 text-center text-gray-600 text-sm">
          <p className="font-black text-white text-lg mb-2">
            EURO<span className="text-green-400">KIT</span>
          </p>
          <p>유럽 축구 유니폼 전문 쇼핑몰 · 개발 연습용</p>
          <p className="mt-2">Powered by Next.js + Supabase</p>
        </footer>
      </body>
    </html>
  );
}
