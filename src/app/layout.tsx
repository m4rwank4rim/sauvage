import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { siteConfig } from "../config/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

import NextAuthProvider from "../components/NextAuthProvider";

export const metadata: Metadata = {
  title: `${siteConfig.agencyName} — Premier Los Santos Brand & Creative Agency`,
  description: siteConfig.subheadline,
  keywords: [
    "GTA World",
    "GTAW",
    "Graphic Design",
    "Creative Agency",
    "Fleeca Bank",
    "Los Santos",
    "Roleplay",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} scroll-smooth`}>
      <body className="bg-background text-text-primary antialiased selection:bg-electric-lime selection:text-background flex flex-col min-h-screen">
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
