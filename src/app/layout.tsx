import type { Metadata } from "next";
import localFont from "next/font/local";
import { assetPath } from "@/lib/site-paths";
import "./globals.css";

const azeretMono = localFont({
  src: "./fonts/AzeretMono-Variable.woff2",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

const familjen = localFont({
  src: "./fonts/FamiljenGrotesk-Variable.woff2",
  variable: "--font-body",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SceneBreaker — Break the route.",
  description:
    "Build a robot-route experiment. Import a scene, edit paths and motion, then find and replay speed-and-timing failures. No account or GPU server.",
  icons: { icon: assetPath("/icon.svg") },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${azeretMono.variable} ${familjen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
