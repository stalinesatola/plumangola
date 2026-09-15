import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plum Angola",
  description: "Plum Angola — espaços e serviços online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
