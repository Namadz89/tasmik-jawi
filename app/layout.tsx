import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rekod Tasmik & Jawi",
  description: "Sistem Rekod Tasmik dan Jawi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
