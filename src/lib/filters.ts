import type { Vehicle } from "@/data/vehicles";

export type Filters = {
  budgetMax: number | null;
  categorie: string;
  carburant: string;
  boite: string;
  anneeMin: number | null;
  kmMax: number | null;
  places: string;
};

export const emptyFilters: Filters = {
  budgetMax: null,
  categorie: "",
  carburant: "",
  boite: "",
  anneeMin: null,
  kmMax: null,
  places: "",
};

export const CATEGORIES = ["SUV", "Berline", "Pick-up", "Citadine"];
export const CARBURANTS = ["Essence", "Diesel"];
export const BOITES = ["Automatique", "Manuelle"];

export const BUDGETS = [
  { label: "Moins de 6 000 000 FCFA", value: 6000000 },
  { label: "Moins de 10 000 000 FCFA", value: 10000000 },
  { label: "Moins de 15 000 000 FCFA", value: 15000000 },
  { label: "Moins de 25 000 000 FCFA", value: 25000000 },
  { label: "Plus de 25 000 000 FCFA", value: 100000000 },
];

export function filterVehicles(list: Vehicle[], f: Filters): Vehicle[] {
  return list.filter((v) => {
    if (f.budgetMax && v.prix > f.budgetMax) return false;
    if (f.categorie && v.categorie !== f.categorie) return false;
    if (f.carburant && v.carburant !== f.carburant) return false;
    if (f.boite && v.boite !== f.boite) return false;
    if (f.anneeMin && v.annee < f.anneeMin) return false;
    if (f.kmMax && v.kilometrage > f.kmMax) return false;
    if (f.places && v.places < Number(f.places)) return false;
    return true;
  });
}

const KEY = "autoivoire-preferences";

export function loadFilters(): Filters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...emptyFilters, ...(JSON.parse(raw) as Filters) } : null;
  } catch {
    return null;
  }
}

export function saveFilters(f: Filters) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
}

export function describeFilters(f: Filters): string {
  const parts: string[] = [];
  if (f.budgetMax) parts.push(`budget max ${f.budgetMax} FCFA`);
  if (f.categorie) parts.push(`type ${f.categorie}`);
  if (f.carburant) parts.push(`carburant ${f.carburant}`);
  if (f.boite) parts.push(`boîte ${f.boite}`);
  if (f.anneeMin) parts.push(`année min ${f.anneeMin}`);
  if (f.kmMax) parts.push(`kilométrage max ${f.kmMax}`);
  if (f.places) parts.push(`au moins ${f.places} places`);
  return parts.length ? parts.join(", ") : "aucun critère";
}

