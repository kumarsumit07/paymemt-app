import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { SkipLink } from "@/components/ui/SkipLink";

export const metadata: Metadata = {
  title: "Payment Gateway Simulator",
  description: "A production-quality payment gateway simulation built with Next.js App Router.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-fintech font-sans" suppressHydrationWarning>
        <SkipLink />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
