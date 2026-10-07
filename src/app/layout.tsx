import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const uncutSans = localFont({
  src: "./fonts/UncutSans-Variable.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

const splineSans = localFont({
  src: "./fonts/SplineSans-Variable.woff2",
  variable: "--font-body",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SceneBreaker — Small changes. Big failures.",
  description:
    "Find, minimize, and replay robot-navigation failures in an interactive 3D sandbox. Deterministic experiments, fair search comparisons, and reproducible evidence.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${uncutSans.variable} ${splineSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
