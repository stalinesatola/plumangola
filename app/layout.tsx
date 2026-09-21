import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plum Angola",
  description: "Plum Angola — espaços e serviços online.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reflete o idioma correto (pt/en) mesmo nas páginas fora de app/[locale]
  // (ex: /admin, que fica sempre em português por defeito).
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
