import type { Metadata } from "next";
import "./globals.css";

// Toutes les pages sont dynamiques (auth par cookie) — évite la génération
// statique qui spawn des workers supplémentaires et crashe sur O2Switch
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "JobQuest — Recherche collaborative",
  description: "Outil collaboratif de suivi de candidatures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
