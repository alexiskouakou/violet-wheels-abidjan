import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import car4 from "@/assets/car-4.jpg";
import hero from "@/assets/hero-vehicle.jpg";

export const CONTACT_PHONE = "+2250700000000";
export const CONTACT_PHONE_DISPLAY = "+225 07 00 00 00 00";

export type Vehicle = {
  id: string;
  nom: string;
  marque: string;
  modele: string;
  annee: number;
  prix: number;
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
  vedette?: boolean;
};

export const vehicles: Vehicle[] = [
  {
    id: "suv-urbain-2022",
    nom: "SUV Urbain 1.5 Confort",
    marque: "Toyota",
    modele: "Urban Cross",
    annee: 2022,
    prix: 12500000,
    image: hero,
    kilometrage: 38000,
    carburant: "Essence",
    boite: "Automatique",
    places: 5,
    portes: 5,
    moteur: "1.5L 4 cylindres",
    puissance: "106 ch",
    transmission: "Traction avant",
    couleur: "Gris argent",
    etat: "Occasion importée, très bon état",
    ville: "Abidjan, Cocody",
    description:
      "Un SUV compact idéal pour les routes d'Abidjan : garde au sol confortable, climatisation puissante et faible consommation en ville. Entretien à jour, carnet disponible.",
    equipements: [
      "Climatisation automatique",
      "Caméra de recul",
      "Écran tactile Bluetooth",
      "Jantes alliage 17\"",
      "Régulateur de vitesse",
      "Vitres électriques",
    ],
    vedette: true,
  },
  {
    id: "berline-corolla-2021",
    nom: "Berline Corolla 1.6 Élégance",
    marque: "Toyota",
    modele: "Corolla",
    annee: 2021,
    prix: 9800000,
    image: car1,
    kilometrage: 52000,
    carburant: "Essence",
    boite: "Automatique",
    places: 5,
    portes: 4,
    moteur: "1.6L 4 cylindres",
    puissance: "122 ch",
    transmission: "Traction avant",
    couleur: "Blanc nacré",
    etat: "Occasion, entretien à jour",
    ville: "Abidjan, Marcory",
    description:
      "La berline la plus fiable du marché ivoirien. Pièces disponibles partout, consommation maîtrisée et confort de route excellent pour les trajets Abidjan–intérieur.",
    equipements: [
      "Climatisation",
      "Bluetooth / USB",
      "Capteurs de recul",
      "Airbags conducteur et passager",
      "Direction assistée",
    ],
  },
  {
    id: "pickup-double-cabine-2020",
    nom: "Pick-up Double Cabine 4x4",
    marque: "Ford",
    modele: "Ranger",
    annee: 2020,
    prix: 16500000,
    image: car2,
    kilometrage: 74000,
    carburant: "Diesel",
    boite: "Manuelle",
    places: 5,
    portes: 4,
    moteur: "2.2L TDCi",
    puissance: "160 ch",
    transmission: "4x4 enclenchable",
    couleur: "Noir",
    etat: "Occasion pro, robuste",
    ville: "Abidjan, Yopougon",
    description:
      "Parfait pour les chantiers et les déplacements hors bitume. Châssis renforcé, benne utilitaire et 4x4 fiable pour la saison des pluies.",
    equipements: [
      "4x4 avec réducteur",
      "Barres anti-roulis",
      "Attelage remorque",
      "Climatisation",
      "Pneus tout-terrain neufs",
    ],
  },
  {
    id: "citadine-2019",
    nom: "Citadine 1.0 Économique",
    marque: "Volkswagen",
    modele: "City",
    annee: 2019,
    prix: 5200000,
    image: car3,
    kilometrage: 88000,
    carburant: "Essence",
    boite: "Manuelle",
    places: 5,
    portes: 5,
    moteur: "1.0L 3 cylindres",
    puissance: "75 ch",
    transmission: "Traction avant",
    couleur: "Gris",
    etat: "Occasion, bon état général",
    ville: "Abidjan, Treichville",
    description:
      "La petite voiture idéale pour circuler dans les embouteillages du Plateau : faible consommation, facile à garer et entretien peu coûteux.",
    equipements: [
      "Climatisation",
      "Radio Bluetooth",
      "Verrouillage centralisé",
      "ABS",
    ],
  },
  {
    id: "suv-premium-2023",
    nom: "SUV Premium 7 places",
    marque: "Nissan",
    modele: "Pathfinder",
    annee: 2023,
    prix: 24900000,
    image: car4,
    kilometrage: 21000,
    carburant: "Essence",
    boite: "Automatique",
    places: 7,
    portes: 5,
    moteur: "3.5L V6",
    puissance: "284 ch",
    transmission: "Intégrale AWD",
    couleur: "Bleu nuit",
    etat: "Comme neuf",
    ville: "Abidjan, Riviera",
    description:
      "Grand SUV familial haut de gamme : sept places confortables, intérieur cuir et équipements complets pour les longs trajets.",
    equipements: [
      "Sièges cuir chauffants",
      "Toit ouvrant panoramique",
      "Caméra 360°",
      "Démarrage sans clé",
      "Apple CarPlay / Android Auto",
      "Climatisation tri-zone",
    ],
  },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const whatsappLink = (v?: Vehicle) =>
  `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}?text=` +
  encodeURIComponent(
    v
      ? `Bonjour, je suis intéressé(e) par le véhicule : ${v.nom} (${v.annee}) à ${formatPrice(v.prix)}.`
      : "Bonjour, je souhaite des informations sur vos véhicules disponibles.",
  );
