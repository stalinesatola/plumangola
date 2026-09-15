import Link from "next/link";

export default function DlaminiLojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dlamini-loja" className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-widest text-plum-600">
              Plum Angola
            </span>
            <span className="text-lg font-bold text-gray-900">
              Dlamini Loja
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-plum-600">
            ← plum-angola.com
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
