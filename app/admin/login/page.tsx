import { LoginForm } from "@/components/admin/LoginForm";
import { PlumLogo } from "@/components/PlumLogo";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4">
          <PlumLogo height={40} href={undefined} />
        </div>
        <h1 className="mb-6 text-xl font-bold text-gray-900">
          Painel de administração
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
