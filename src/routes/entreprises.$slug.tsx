import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { getEntreprise } from "@/lib/entreprises.functions";
import { VehicleCard } from "@/components/VehicleCard";
import placeholder from "@/assets/car-1.jpg";

export const Route = createFileRoute("/entreprises/$slug")({
  loader: async ({ params }) => {
    const res = await getEntreprise({ data: { slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Entreprise introuvable — Zoom Auto" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const e = loaderData.entreprise;
    const title = `${e.nom} — véhicules en vente à Abidjan | Zoom Auto`;
    const desc = e.description.slice(0, 155) || `Découvrez les véhicules proposés par ${e.nom} sur Zoom Auto.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Entreprise introuvable</h1>
      <Link to="/" className="mt-4 inline-block text-primary">Retour à l'accueil</Link>
    </main>
  ),
  errorComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p>Impossible de charger cette entreprise.</p>
    </main>
  ),
  component: EntreprisePage,
});

function EntreprisePage() {
  const { entreprise: e, vehicules } = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Retour à l'accueil
        </Link>

        <section className="mt-6 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
            {e.logo ? (
              <img src={e.logo} alt={`Logo ${e.nom}`} className="size-full object-contain p-2" />
            ) : (
              <Building2 className="size-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{e.nom}</h1>
            {e.localisation && (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {e.localisation}
              </p>
            )}
            {e.description && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{e.description}</p>}
          </div>
        </section>

        <h2 className="mt-12 text-2xl font-extrabold">Véhicules de {e.nom}</h2>
        {vehicules.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucun véhicule disponible pour le moment.</p>
        ) : (
          <div className="mt-6 grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {vehicules.map((v) => (
              <VehicleCard key={v.id} vehicle={{ ...v, image: v.image || placeholder }} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
