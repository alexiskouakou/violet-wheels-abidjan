import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { formatPrice, CONTACT_PHONE_DISPLAY, type Vehicle } from "@/data/vehicles";
import { ContactButtons } from "@/components/ContactButtons";
import { getPublishedVehicle } from "@/lib/vehicles.functions";
import placeholder from "@/assets/car-1.jpg";

export const Route = createFileRoute("/vehicules/$id")({
  loader: async ({ params }) => {
    const publie = await getPublishedVehicle({ data: { slug: params.id } });
    if (!publie) throw notFound();
    const vehicle: Vehicle = { ...publie, image: publie.image || placeholder };
    return { vehicle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Véhicule introuvable — Zoom Auto" },
          { name: "description", content: "Ce véhicule n'est plus disponible sur Zoom Auto." },
          { property: "og:title", content: "Véhicule introuvable — Zoom Auto" },
          { property: "og:description", content: "Ce véhicule n'est plus disponible sur Zoom Auto." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { vehicle } = loaderData;
    const title = `${vehicle.nom} (${vehicle.annee}) — ${formatPrice(vehicle.prix)} à Abidjan`;
    const description = `${vehicle.marque} ${vehicle.modele} ${vehicle.annee}, ${vehicle.carburant}, ${vehicle.boite}, ${vehicle.kilometrage} km. Disponible à ${vehicle.ville}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: VehicleDetail,
});

function VehicleDetail() {
  const { vehicle } = Route.useLoaderData();

  const specs: [string, string][] = [
    ["Marque", vehicle.marque],
    ["Modèle", vehicle.modele],
    ["Année", String(vehicle.annee)],
    ["Kilométrage", `${new Intl.NumberFormat("fr-FR").format(vehicle.kilometrage)} km`],
    ["Carburant", vehicle.carburant],
    ["Boîte de vitesses", vehicle.boite],
    ["Moteur", vehicle.moteur],
    ["Puissance", vehicle.puissance],
    ["Transmission", vehicle.transmission],
    ["Places", `${vehicle.places}`],
    ["Portes", `${vehicle.portes}`],
    ["Couleur", vehicle.couleur],
    ["Neuf / Occasion", vehicle.condition ?? "Occasion"],
    ["État", vehicle.etat],
    ["Localisation", vehicle.ville],
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour aux véhicules
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <img
            src={vehicle.image}
            alt={`${vehicle.marque} ${vehicle.modele} ${vehicle.annee}`}
            width={1200}
            height={800}
            className="aspect-[3/2] w-full rounded-3xl object-cover shadow-card"
          />

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h1 className="text-2xl font-extrabold leading-tight">{vehicle.nom}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicle.annee} · {vehicle.ville}
            </p>
            {vehicle.entreprise && (
              <Link
                to="/entreprises/$slug"
                params={{ slug: vehicle.entreprise.slug }}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary"
              >
                {vehicle.entreprise.logo && (
                  <img src={vehicle.entreprise.logo} alt="" className="size-6 rounded object-contain" />
                )}
                Vendu par <span className="font-semibold text-primary">{vehicle.entreprise.nom}</span>
              </Link>
            )}
            <p className="mt-4 text-3xl font-extrabold text-primary">
              {formatPrice(vehicle.prix)}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{vehicle.description}</p>
            <ContactButtons vehicle={vehicle} className="mt-6" />
            <p className="mt-3 text-xs text-muted-foreground">
              Téléphone : {CONTACT_PHONE_DISPLAY} — essai possible sur rendez-vous.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Fiche technique</h2>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 bg-card px-5 py-3.5">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Équipements</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.equipements.map((e) => (
              <li
                key={e}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <Check className="size-4 text-primary" aria-hidden="true" />
                {e}
              </li>
            ))}
          </ul>
        </section>

        <div className="pb-16" />
      </div>
    </main>
  );
}
