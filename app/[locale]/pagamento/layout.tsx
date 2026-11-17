import { PlumLogo } from "@/components/PlumLogo";

export default function PagamentoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <PlumLogo variant="lockup" height={40} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>
    </div>
  );
}
