import { Phone, MessageCircle } from "lucide-react";
import { CONTACT_PHONE, whatsappLink, type Vehicle } from "@/data/vehicles";

export function ContactButtons({
  vehicle,
  className = "",
}: {
  vehicle?: Vehicle;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={whatsappLink(vehicle)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-semibold text-success-foreground shadow-card transition-transform hover:scale-[1.02]"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Contacter sur WhatsApp
      </a>
      <a
        href={`tel:${CONTACT_PHONE}`}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
      >
        <Phone className="size-4" aria-hidden="true" />
        Appeler maintenant
      </a>
    </div>
  );
}
