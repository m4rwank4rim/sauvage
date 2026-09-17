import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { siteConfig } from "../config/siteConfig";
import { Toaster } from "react-hot-toast";
import { CommandPalette } from "../components/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${inter.variable} ${syne.variable} scroll-smooth`}>
      <body className="bg-background text-text-primary antialiased selection:bg-electric-lime selection:text-background flex flex-col min-h-screen">
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CommandPalette />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#0B0B0D",
                color: "#FAFAFA",
                border: "1px solid #CCFF00",
                borderRadius: "12px",
                padding: "14px 16px",
                fontSize: "13px",
                fontFamily: "var(--font-inter)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(204,255,0,0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#CCFF00",
                  secondary: "#0B0B0D",
                },
              },
              error: {
                iconTheme: {
                  primary: "#FF5C5C",
                  secondary: "#0B0B0D",
                },
              },
            }}
          />
        </NextAuthProvider>
      </body>
    </html>
  );
}
