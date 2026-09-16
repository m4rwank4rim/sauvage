import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { siteConfig } from "../config/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-[#0F0529] text-[#F5F3FA] antialiased selection:bg-[#CCFF00] selection:text-[#0F0529] flex flex-col min-h-screen">
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
