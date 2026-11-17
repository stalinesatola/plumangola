import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Plum Angola", template: "%s · Plum Angola" },
  description:
    "Plum Angola — websites, lojas online, chatbots com IA, automação e serviços informáticos em Angola.",
  openGraph: {
    siteName: "Plum Angola",
    type: "website",
    images: [{ url: "/logo-plum-angola.png", width: 930, height: 843, alt: "Plum Angola" }],
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  themeColor: "#7e22a8",
  width: "device-width",
  initialScale: 1,
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
