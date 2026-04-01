import type { Metadata } from "next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import OverscrollColor from "@/components/OverscrollColor";

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
    <html lang="en" className={`${lora.variable} ${raleway.variable}`}>
      <body>
        <OverscrollColor />
        <Header />
        <div className="pt-6">
          {children}
        </div>
        <footer className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 py-8">
          <p className="text-sm text-white/50 text-center">
            Continua &mdash; a new language for understanding each other
          </p>
        </footer>
      </body>
    </html>
  );
}
