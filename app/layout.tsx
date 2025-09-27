import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SessionProvider } from "@/components/session-context";
import { Suspense } from "react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kontrakan Hitam",
  description: "Checklist Piket Harian Kontrakan",
  generator: "vscode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Toaster />
        <SessionProvider>
          <Suspense>{children}</Suspense>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
