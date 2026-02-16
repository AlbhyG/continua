import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Continua",
  description:
    "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Header />
        {children}
        <footer className="max-w-[375px] md:max-w-[720px] mx-auto px-6 py-8 text-[14px] opacity-70">
          <Link href="/privacy" className="underline hover:opacity-100 transition-opacity">Privacy Policy</Link>
        </footer>
      </body>
    </html>
  );
}
