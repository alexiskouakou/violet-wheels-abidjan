export const CONTACT_PHONE = "+2250700000000";
export const CONTACT_PHONE_DISPLAY = "+225 07 00 00 00 00";

export type Vehicle = {
  id: string;
  nom: string;
  marque: string;
  modele: string;
  annee: number;
  prix: number;
  categorie: "SUV" | "Berline" | "Pick-up" | "Citadine";
  image: string;
  kilometrage: number;
  carburant: string;
  boite: string;
  places: number;
  portes: number;
  moteur: string;
  puissance: string;
  transmission: string;
  couleur: string;
  etat: string;
  ville: string;
  description: string;
  equipements: string[];
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const whatsappLink = (v?: Vehicle) =>
  `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}?text=` +
  encodeURIComponent(
    v
      ? `Bonjour, je suis intéressé(e) par le véhicule : ${v.nom} (${v.annee}) à ${formatPrice(v.prix)}.`
      : "Bonjour, je souhaite des informations sur vos véhicules disponibles.",
  );
