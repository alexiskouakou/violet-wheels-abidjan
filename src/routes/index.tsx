import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { formatPrice, CONTACT_PHONE_DISPLAY } from "@/data/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { ContactButtons } from "@/components/ContactButtons";
import { PreferencesModal } from "@/components/PreferencesModal";
import { VehicleFilters } from "@/components/VehicleFilters";
import {
  emptyFilters,
  filterVehicles,
  loadFilters,
  saveFilters,
  type Filters,
} from "@/lib/filters";
import { useAllVehicles } from "@/lib/use-vehicles";
import { EntreprisesStrip } from "@/components/EntreprisesStrip";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vente de véhicules à Abidjan — Zoom Auto" },
      {
        name: "description",
        content:
          "Comparez les véhicules proposés par des concessionnaires et partenaires automobiles à Abidjan, puis échangez avec notre équipe ou notre IA.",
      },
      { property: "og:title", content: "Vente de véhicules à Abidjan — Zoom Auto" },
      {
        property: "og:description",
        content:
          "Découvrez les offres de véhicules de concessionnaires et partenaires automobiles à Abidjan.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://occasion.automobile.tn/2025/11/120863/2eMAlMrypk29_YYkrVOSQ7Rl0_max.jpeg?t=73eabcbd7471752de5c2001f02a8aa76" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://occasion.automobile.tn/2025/11/120863/2eMAlMrypk29_YYkrVOSQ7Rl0_max.jpeg?t=73eabcbd7471752de5c2001f02a8aa76" },
    ],
  }),
  component: Index,
});

function Index() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = loadFilters();
    if (saved) setFilters(saved);
    else setModalOpen(true);
  }, []);

  const update = (f: Filters) => {
    setFilters(f);
    saveFilters(f);
  };

  const tous = useAllVehicles();
  const vedette = tous[0];
  const resultats = filterVehicles(tous, filters);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandLogo className="h-10 w-auto max-w-44 object-contain" />
          <a
            href="#vehicules"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Véhicules disponibles
          </a>
        </div>
      </header>

      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
              Abidjan · Côte d'Ivoire
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              Votre prochaine voiture, achetée en toute confiance à Abidjan
            </h1>
            <p className="mt-4 max-w-lg text-base opacity-90">
              Votre véhicule, simplement. ZoomAuto vous donne accès à une sélection de
              véhicules proposés par des concessionnaires et partenaires automobiles.
              Comparez les offres, demandez conseil à notre IA ou échangez directement
              avec notre équipe pour être accompagné dans votre achat.
            </p>
            <ContactButtons className="mt-8" />
            <p className="mt-4 text-sm opacity-80">
              Téléphone : {CONTACT_PHONE_DISPLAY}
            </p>
          </div>

          {vedette ? (
            <div className="rounded-3xl bg-card p-5 shadow-card">
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                Véhicule mis en avant
              </span>
              <img
                src={vedette.image}
                alt={`${vedette.marque} ${vedette.modele} ${vedette.annee} en vente à Abidjan`}
                width={1600}
                height={1000}
                className="mt-4 aspect-[8/5] w-full rounded-2xl object-cover"
              />
              <h2 className="mt-5 text-2xl font-bold">{vedette.nom}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {vedette.annee} · {new Intl.NumberFormat("fr-FR").format(vedette.kilometrage)} km ·{" "}
                {vedette.carburant} · {vedette.boite}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-2xl font-extrabold text-primary">
                  {formatPrice(vedette.prix)}
                </span>
                <Link
                  to="/vehicules/$id"
                  params={{ id: vedette.id }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Voir la fiche <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-primary-foreground/20 px-8 text-center text-primary-foreground">
              <p className="max-w-sm font-semibold">Notre prochain véhicule sera bientôt disponible.</p>
            </div>
          )}
        </div>
      </section>

      <EntreprisesStrip />

      <section id="vehicules" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-3xl font-extrabold">Véhicules disponibles</h2>
        <p className="mt-2 text-muted-foreground">
          {resultats.length} véhicule{resultats.length > 1 ? "s" : ""} sur {tous.length} correspondent à vos critères.
        </p>

        <div className="mt-5">
          <VehicleFilters filters={filters} onChange={update} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Modifier mes réponses
          </button>
          <Link
            to="/recherche"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Recherche avancée
          </Link>
        </div>

        {resultats.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Aucun véhicule ne correspond à vos critères. Élargissez votre budget ou
            demandez conseil à notre assistant.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultats.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      <PreferencesModal
        open={modalOpen}
        initial={filters}
        onClose={() => {
          setModalOpen(false);
          saveFilters(filters);
        }}
        onSubmit={(f) => {
          update(f);
          setModalOpen(false);
          document.getElementById("vehicules")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandLogo className="h-9 w-auto max-w-40 object-contain" />
            <p className="text-sm text-muted-foreground">
              Vente de véhicules à Abidjan · {CONTACT_PHONE_DISPLAY}
            </p>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary">
              Espace vendeur
            </Link>
          </div>
          <ContactButtons />
        </div>
      </footer>
    </main>
  );
}
