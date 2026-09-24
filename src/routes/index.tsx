import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, FileCheck2, Handshake, ArrowRight, SlidersHorizontal } from "lucide-react";
import { vehicles, formatPrice, CONTACT_PHONE_DISPLAY } from "@/data/vehicles";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vente de véhicules à Abidjan — Auto Ivoire" },
      {
        name: "description",
        content:
          "Achetez votre voiture à Abidjan : SUV, berlines, pick-up et citadines vérifiés, prix en FCFA, contact direct par WhatsApp ou téléphone.",
      },
      { property: "og:title", content: "Vente de véhicules à Abidjan — Auto Ivoire" },
      {
        property: "og:description",
        content:
          "Véhicules disponibles à Abidjan, papiers en règle et essai possible. Contactez-nous par WhatsApp ou par téléphone.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const vedette = vehicles.find((v) => v.vedette) ?? vehicles[0]!;
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
  const resultats = filterVehicles(tous, filters);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-extrabold tracking-tight">
            Auto<span className="text-primary">Ivoire</span>
          </span>
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
              Nous sélectionnons, vérifions et vendons des véhicules d'occasion et
              quasi neufs à Abidjan. Papiers en règle, essai sur place et
              accompagnement jusqu'à la mutation de la carte grise.
            </p>
            <ContactButtons className="mt-8" />
            <p className="mt-4 text-sm opacity-80">
              Téléphone : {CONTACT_PHONE_DISPLAY}
            </p>
          </div>

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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              titre: "Véhicules vérifiés",
              texte: "Contrôle mécanique et historique du kilométrage avant mise en vente.",
            },
            {
              icon: FileCheck2,
              titre: "Papiers en règle",
              texte: "Carte grise, visite technique et mutation accompagnée à Abidjan.",
            },
            {
              icon: Handshake,
              titre: "Prix négociés",
              texte: "Paiement échelonné possible et reprise de votre ancien véhicule.",
            },
          ].map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{titre}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{texte}</p>
            </div>
          ))}
        </div>
      </section>

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
            <p className="font-bold">AutoIvoire</p>
            <p className="text-sm text-muted-foreground">
              Vente de véhicules à Abidjan · {CONTACT_PHONE_DISPLAY}
            </p>
          </div>
          <ContactButtons />
        </div>
      </footer>
    </main>
  );
}
