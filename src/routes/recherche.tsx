import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAllVehicles } from "@/lib/use-vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEntreprises } from "@/lib/entreprises.functions";
import { emptyFilters, filterVehicles, loadFilters, saveFilters, type Filters } from "@/lib/filters";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche avancée de véhicules à Abidjan — Zoom Auto" },
      {
        name: "description",
        content:
          "Filtrez les véhicules disponibles à Abidjan par budget, type, carburant, boîte, année, kilométrage et nombre de places.",
      },
      { property: "og:title", content: "Recherche avancée de véhicules à Abidjan — Zoom Auto" },
      {
        property: "og:description",
        content:
          "Trouvez la voiture qui correspond exactement à votre budget et à vos besoins à Abidjan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecherchePage,
});

function RecherchePage() {
  const [filters, setFilters] = useState<Filters>(() => loadFilters() ?? emptyFilters);
  const tous = useAllVehicles();
  const listE = useServerFn(listEntreprises);
  const { data: entreprises } = useQuery({ queryKey: ["entreprises"], queryFn: () => listE({}), staleTime: 60_000 });
  const resultats = filterVehicles(tous, filters);

  const update = (f: Filters) => {
    setFilters(f);
    saveFilters(f);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour à l'accueil
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold">Recherche avancée</h1>
        <p className="mt-2 text-muted-foreground">
          Affinez votre recherche parmi nos véhicules disponibles à Abidjan.
        </p>

        <div className="mt-6">
          <VehicleFilters filters={filters} onChange={update} detailed entreprises={entreprises ?? []} />
        </div>

        <p className="mt-6 text-sm font-semibold">
          {resultats.length} véhicule{resultats.length > 1 ? "s" : ""} correspondant
          {resultats.length > 1 ? "s" : ""}
        </p>

        {resultats.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Aucun véhicule ne correspond à ces critères. Élargissez votre budget ou
            demandez conseil à notre assistant.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {resultats.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
