export const WHATSAPP_NUMERO = "244923925509";
export const WHATSAPP_VISIVEL = "+244 923 925 509";
export const EMAIL_CONTACTO = "stalinesatola@gmail.com";

export function linkWhatsapp(mensagem?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMERO}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
