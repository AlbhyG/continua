import type { Metadata } from "next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import OverscrollColor from "@/components/OverscrollColor";
import Link from "next/link";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lora",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-raleway",
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
    title: "Continua: How Opposites Align",
    description:
      "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
    siteName: "Continua",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Continua: How Opposites Align",
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
    <html lang="en" className={`${lora.variable} ${raleway.variable}`}>
      <body>
        <OverscrollColor />
        <Header />
        <div className="pt-24">
          {children}
        </div>
        <footer className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 py-8">
          <nav aria-label="Site information" className="mx-auto mb-4 flex w-fit flex-wrap justify-center gap-x-6 gap-y-3 rounded-lg bg-white/90 px-4 py-3 text-sm font-semibold text-foreground">
            <Link href="/methodology" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Methodology &amp; Limitations</Link>
            <Link href="/privacy" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Privacy policy</Link>
          </nav>
          <p className="text-sm text-white/50 text-center">
            Continua &mdash; How Opposites Align
          </p>
        </footer>
      </body>
    </html>
  );
}
