import Link from "next/link";

export default function ObrigadoPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Pedido enviado com sucesso!
      </h1>
      <p className="max-w-md text-gray-600">
        O Dlamini recebeu a tua encomenda no Telegram e vai entrar em
        contacto contigo brevemente para confirmar os detalhes.
      </p>
      <Link
        href="/dlamini-loja"
        className="rounded-lg bg-plum-600 px-4 py-2 font-semibold text-white hover:bg-plum-700"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
