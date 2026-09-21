import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AppointmentForm } from "@/components/paulirabeauty/AppointmentForm";

export const revalidate = 0;

const TELEFONE = "+244 922 809 707";
const WHATSAPP_URL = "https://wa.me/244922809707";

export default async function PaulirabBeautyPage() {
  const t = await getTranslations("PaulirabBeauty");
  const tServico = await getTranslations("AppointmentForm.category");

  const categorias = [
    tServico("nails"),
    tServico("hair"),
    tServico("facial"),
    tServico("massage"),
    tServico("makeup"),
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 sm:grid-cols-2 sm:items-center">
        <div className="flex flex-col gap-3">
          <p className="text-lg text-gray-700">{t("tagline")}</p>
          <dl className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-900">{t("hoursLabel")}:</dt>
              <dd>{t("hours")}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-900">{t("phoneLabel")}:</dt>
              <dd>
                <a href={`tel:${TELEFONE.replace(/\s/g, "")}`} className="hover:text-plum-600">
                  {TELEFONE}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-900">{t("addressLabel")}:</dt>
              <dd>{t("address")}</dd>
            </div>
          </dl>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-plum-50 px-3 py-1 text-xs font-semibold text-plum-700">
            {t("homeService")}
          </span>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            {t("whatsappButton")}
          </a>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]">
          <Image
            src="/paulirabeauty/hero-1.png"
            alt={t("storeName")}
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          {t("servicesHeading")}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {categorias.map((categoria) => (
            <li
              key={categoria}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
            >
              {categoria}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <AppointmentForm />
      </section>
    </div>
  );
}
