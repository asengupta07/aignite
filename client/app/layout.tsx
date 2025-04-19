import type React from "react";
import "./globals.css";
import { Josefin_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300"],
});

export const metadata = {
  title: "IntersectAI - Where Business and Tech Intersect",
  description:
    "AI-powered platform that bridges gaps between technical and business teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${josefinSans.className}`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
