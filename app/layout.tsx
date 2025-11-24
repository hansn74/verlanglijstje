import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hans z'n Verlanglijstje",
  description: "Een gamified verlanglijst voor verjaardag en Sinterklaas",
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
