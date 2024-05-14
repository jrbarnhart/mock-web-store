import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Nookify",
  description: "Home decor web store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <nav>
          <ul className="grid grid-flow-col gap-y-3 justify-items-center p-6 bg-zinc-300 font-bold text-lg">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/dashboard">Admin</Link>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}
