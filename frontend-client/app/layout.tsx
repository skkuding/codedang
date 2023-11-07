import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Codedang 코드당",
  description: "Codedang, Online Judge for SKKU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="flex gap-1 p-1">
          <Link href="/">Main</Link>
          <Link href="/notice">Notice</Link>
          <Link href="/contest">Contest</Link>
          <Link href="/problem">Problem</Link>
          <Link href="/group">Group</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
