import {
  BOITES,
  BUDGETS,
  CARBURANTS,
  CATEGORIES,
  emptyFilters,
  type Filters,
} from "@/lib/filters";

const selectClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground";

export function VehicleFilters({
  filters,
  onChange,
  detailed = false,
  entreprises = [],
}: {
  entreprises?: { slug: string; nom: string }[];
  filters: Filters;
  onChange: (f: Filters) => void;
  detailed?: boolean;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-muted-foreground">
          Budget
          <select
            className={`mt-1 ${selectClass}`}
            value={filters.budgetMax ?? ""}
            onChange={(e) => set({ budgetMax: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Tous les budgets</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          Type de véhicule
          <select
            className={`mt-1 ${selectClass}`}
            value={filters.categorie}
            onChange={(e) => set({ categorie: e.target.value })}
          >
            <option value="">Tous les types</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          Carburant
          <select
            className={`mt-1 ${selectClass}`}
            value={filters.carburant}
            onChange={(e) => set({ carburant: e.target.value })}
          >
            <option value="">Tous</option>
            {CARBURANTS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          Boîte de vitesses
          <select
            className={`mt-1 ${selectClass}`}
            value={filters.boite}
            onChange={(e) => set({ boite: e.target.value })}
          >
            <option value="">Toutes</option>
            {BOITES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>

        {detailed && (
          <>
            <label className="text-xs font-semibold text-muted-foreground">
              Année minimum
              <input
                type="number"
                min={2000}
                max={2026}
                placeholder="Ex. 2020"
                className={`mt-1 ${selectClass}`}
                value={filters.anneeMin ?? ""}
                onChange={(e) =>
                  set({ anneeMin: e.target.value ? Number(e.target.value) : null })
                }
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Kilométrage maximum
              <input
                type="number"
                min={0}
                step={5000}
                placeholder="Ex. 60000"
                className={`mt-1 ${selectClass}`}
                value={filters.kmMax ?? ""}
                onChange={(e) => set({ kmMax: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Nombre de places
              <select
                className={`mt-1 ${selectClass}`}
                value={filters.places}
                onChange={(e) => set({ places: e.target.value })}
              >
                <option value="">Peu importe</option>
                <option value="5">5 places et plus</option>
                <option value="7">7 places et plus</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Neuf ou occasion
              <select
                className={`mt-1 ${selectClass}`}
                value={filters.condition}
                onChange={(e) => set({ condition: e.target.value })}
              >
                <option value="">Tous</option>
                <option>Neuf</option>
                <option>Occasion</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Entreprise
              <select
                className={`mt-1 ${selectClass}`}
                value={filters.entreprise}
                onChange={(e) => set({ entreprise: e.target.value })}
              >
                <option value="">Toutes</option>
                {entreprises.map((en) => (
                  <option key={en.slug} value={en.slug}>{en.nom}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(emptyFilters)}
        className="mt-3 text-xs font-semibold text-primary underline-offset-2 hover:underline"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
