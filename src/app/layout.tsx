import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infra: Zero to Scale — SRE for Everyone",
  description:
    "An interactive, graph-based roadmap for learning infrastructure, SRE, and DevOps. Whether you're a frontend dev, a vibe coder, or brand new to ops — follow your curiosity from 'what is code?' to production-grade infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL && (
          <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src={process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
