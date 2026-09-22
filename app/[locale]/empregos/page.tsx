import { getTranslations } from "next-intl/server";
import { CvMatchForm } from "@/components/empregos/CvMatchForm";

export const revalidate = 0;

export default async function EmpregosPage() {
  const t = await getTranslations("Empregos");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-lg text-gray-700">{t("tagline")}</p>
        <p className="text-sm text-gray-600">{t("description")}</p>
      </section>

      <CvMatchForm />
    </div>
  );
}
