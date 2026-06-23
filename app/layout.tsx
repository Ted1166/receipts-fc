import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipts FC — World Cup 2026 Pundit Chat",
  description: "AI pundits with persistent memory powered by Walrus. The receipts don't forget.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}