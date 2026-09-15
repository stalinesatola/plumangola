import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessao = token ? await verifySessionToken(token) : null;

  if (!sessao) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin/produtos" className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-widest text-plum-600">
              Plum Angola
            </span>
            <span className="text-lg font-bold text-gray-900">
              Painel de administração
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{sessao.username}</span>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="text-gray-500 hover:text-plum-600"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
