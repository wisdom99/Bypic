import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Threadline — Source African fabric in 24 hours, not 24 days",
  description:
    "A marketplace matching Nigerian fashion designers with verified local textile producers. Browse Ankara, Adire, Aso-oke, Akwete and more — and source by mood board with AI.",
  openGraph: {
    title: "Threadline",
    description:
      "Source African fabric in 24 hours, not 24 days. AI mood-board matching for Nigerian designers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen font-sans">
        <Navbar />
        <main className="pb-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
