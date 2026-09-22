import { useState } from "react";
import { X } from "lucide-react";
import {
  BOITES,
  BUDGETS,
  CARBURANTS,
  CATEGORIES,
  emptyFilters,
  type Filters,
} from "@/lib/filters";

export function PreferencesModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: Filters;
  onClose: () => void;
  onSubmit: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(initial ?? emptyFilters);

  if (!open) return null;

  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  const Group = ({
    label,
    options,
    value,
    onPick,
  }: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onPick: (v: string) => void;
  }) => (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onPick(value === o.value ? "" : o.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-card-foreground hover:border-primary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Trouvons votre véhicule</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Répondez à 4 questions rapides, nous affichons uniquement les véhicules
              qui vous correspondent.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <Group
            label="Quel est votre budget ?"
            options={BUDGETS.map((b) => ({ label: b.label, value: String(b.value) }))}
            value={draft.budgetMax ? String(draft.budgetMax) : ""}
            onPick={(v) => set({ budgetMax: v ? Number(v) : null })}
          />
          <Group
            label="Quel type de véhicule cherchez-vous ?"
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            value={draft.categorie}
            onPick={(v) => set({ categorie: v })}
          />
          <Group
            label="Quel carburant ?"
            options={CARBURANTS.map((c) => ({ label: c, value: c }))}
            value={draft.carburant}
            onPick={(v) => set({ carburant: v })}
          />
          <Group
            label="Quelle boîte de vitesses ?"
            options={BOITES.map((b) => ({ label: b, value: b }))}
            value={draft.boite}
            onPick={(v) => set({ boite: v })}
          />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onSubmit(draft)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Voir les véhicules correspondants
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold"
          >
            Voir tout le stock
          </button>
        </div>
      </div>
    </div>
  );
}
