import Link from "next/link";

type Espaco = {
  slug: string;
  nome: string;
  descricao: string;
  disponivel: boolean;
};

const espacos: Espaco[] = [
  {
    slug: "dlamini-loja",
    nome: "Dlamini Loja",
    descricao:
      "Espaço do agente revendedor Dlamini, com produtos de arthur-ford.com e pedidos enviados diretamente por Telegram.",
    disponivel: true,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-plum-600">
          Plum Angola
        </span>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Um só domínio, vários espaços.
        </h1>
        <p className="max-w-2xl text-gray-600">
          plum-angola.com reúne diferentes espaços independentes — lojas de
          agentes revendedores, serviços e projetos — cada um com o seu
          próprio endereço abaixo deste domínio.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {espacos.map((espaco) => (
          <Link
            key={espaco.slug}
            href={`/${espaco.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-gray-200 p-6 transition hover:border-plum-400 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-plum-700 group-hover:text-plum-600">
              {espaco.nome}
            </h2>
            <p className="text-sm text-gray-600">{espaco.descricao}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
