import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Chrome from "@/components/chrome";
import { ThemeSync } from "@/components/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Debates.ch — Debate anyone. Improve every round.",
    template: "%s | Debates.ch",
  },
  description:
    "Debate people or Bots to receive clear analysis and sharpen the skills that make arguments matter.",
};

export const viewport: Viewport = {
  themeColor: "#302e2b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-background text-fg antialiased">
        <ThemeSync />
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
