import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/layout/Header";
import OverscrollColor from "@/components/OverscrollColor";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Continua",
    template: "%s | Continua",
  },
  description:
    "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Continua",
    description:
      "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
    siteName: "Continua",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Continua",
    description:
      "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <OverscrollColor />
        <Header />
        <main className="pt-6">
        {children}
        </main>
        <footer className="max-w-[375px] md:max-w-[720px] mx-auto px-6 py-8 text-[14px] opacity-70">
          <Link href="/privacy" className="underline hover:opacity-100 transition-opacity">Privacy Policy</Link>
        </footer>
      </body>
    </html>
  );
}
