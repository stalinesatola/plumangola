import Image from "next/image";
import { Link } from "@/i18n/navigation";

type PlumLogoProps = {
  /** Altura visual do logo em pixels (a largura segue a proporção). */
  height?: number;
  /** `lockup` = fruta + texto; `mark` = só a fruta (ícone). */
  variant?: "lockup" | "mark";
  href?: string;
  priority?: boolean;
  className?: string;
};

/** Proporções aproximadas dos PNGs em /public. */
const ASPECTO = {
  lockup: 930 / 843,
  mark: 1,
} as const;

const SRC = {
  lockup: "/logo-plum-angola.png",
  mark: "/logo-plum-mark.png",
} as const;

export function PlumLogo({
  height = 48,
  variant = "lockup",
  href = "/",
  priority = false,
  className = "",
}: PlumLogoProps) {
  const width = Math.round(height * ASPECTO[variant]);

  const imagem = (
    <Image
      src={SRC[variant]}
      alt="Plum Angola"
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto ${className}`}
      style={{ height, width: "auto" }}
    />
  );

  if (!href) {
    return imagem;
  }

  return (
    <Link href={href} className="inline-flex items-center" aria-label="Plum Angola">
      {imagem}
    </Link>
  );
}
