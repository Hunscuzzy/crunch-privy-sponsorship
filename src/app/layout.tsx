import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Privy Solana Sponsorship Demo",
  description: "Demo app for testing Solana transaction sponsorship with Privy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
