import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">
          Painel de administração
        </h1>
        <p className="mb-6 text-sm text-gray-500">Plum Angola</p>
        <LoginForm />
      </div>
    </div>
  );
}
