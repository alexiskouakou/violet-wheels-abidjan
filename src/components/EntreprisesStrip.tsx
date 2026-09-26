import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listEntreprises } from "@/lib/entreprises.functions";

export function EntreprisesStrip() {
  const list = useServerFn(listEntreprises);
  const { data } = useQuery({ queryKey: ["entreprises"], queryFn: () => list({}), staleTime: 60_000 });
  const avecLogo = (data ?? []).filter((e) => e.logo);
  if (avecLogo.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold">Nos entreprises partenaires</h2>
      <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
        {avecLogo.map((e) => (
          <Link
            key={e.id}
            to="/entreprises/$slug"
            params={{ slug: e.slug }}
            className="flex w-36 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary sm:w-44"
          >
            <img src={e.logo} alt={`Logo ${e.nom}`} className="h-16 w-full object-contain" loading="lazy" />
            <span className="line-clamp-1 text-center text-sm font-semibold">{e.nom}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
