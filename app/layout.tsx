import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hans z'n Verlanglijstje",
  description: "Wat zou Hans willen? Open de cadeautjes en ontdek het!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
