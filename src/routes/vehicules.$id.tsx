import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { vehicles, formatPrice, CONTACT_PHONE_DISPLAY } from "@/data/vehicles";
import { ContactButtons } from "@/components/ContactButtons";

export const Route = createFileRoute("/vehicules/$id")({
  loader: ({ params }) => {
    const vehicle = vehicles.find((v) => v.id === params.id);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Véhicule introuvable" }, { name: "robots", content: "noindex" }],
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
    ["État", vehicle.etat],
    ["Localisation", vehicle.ville],
  ];

  const autres = vehicles.filter((v) => v.id !== vehicle.id).slice(0, 3);

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

        <section className="mt-14 pb-16">
          <h2 className="text-xl font-bold">Autres véhicules disponibles</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {autres.map((v) => (
              <Link
                key={v.id}
                to="/vehicules/$id"
                params={{ id: v.id }}
                className="rounded-2xl border border-border bg-card p-3 shadow-card transition-transform hover:-translate-y-1"
              >
                <img
                  src={v.image}
                  alt={v.nom}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="aspect-[3/2] w-full rounded-xl object-cover"
                />
                <p className="mt-3 text-sm font-semibold">{v.nom}</p>
                <p className="text-sm text-primary">{formatPrice(v.prix)}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
