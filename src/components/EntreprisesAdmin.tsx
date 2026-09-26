import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listEntreprises,
  saveEntreprise,
  deleteEntreprise,
  type Entreprise,
} from "@/lib/entreprises.functions";

type Form = { id?: string; nom: string; logo: string; localisation: string; description: string };
const vide: Form = { nom: "", logo: "", localisation: "", description: "" };
const input = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";

export function EntreprisesAdmin() {
  const lister = useServerFn(listEntreprises);
  const enregistrer = useServerFn(saveEntreprise);
  const supprimer = useServerFn(deleteEntreprise);
  const [liste, setListe] = useState<Entreprise[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const recharger = async () => setListe(await lister({}));
  useEffect(() => {
    void recharger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const envoyerLogo = async (file: File) => {
    if (!form) return;
    setBusy(true);
    setMsg("");
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (error) {
      setMsg("Envoi du logo impossible.");
      setBusy(false);
      return;
    }
    const { data } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setForm({ ...form, logo: data?.signedUrl ?? "" });
    setBusy(false);
  };

  const onSave = async () => {
    if (!form || !form.nom.trim()) return;
    setBusy(true);
    try {
      await enregistrer({ data: { ...form, nom: form.nom.trim() } });
      setForm(null);
      await recharger();
    } catch {
      setMsg("Enregistrement impossible (nom peut-être déjà utilisé).");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Entreprises enregistrées</h2>
        <button
          type="button"
          onClick={() => setForm({ ...vide })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Ajouter une entreprise
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Les entreprises citées dans vos descriptions de véhicules sont ajoutées ici automatiquement.
      </p>
      {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}

      {form && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Nom</span>
            <input className={input} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Localisation</span>
            <input
              className={input}
              placeholder="Ex : Marcory, Abidjan"
              value={form.localisation}
              onChange={(e) => setForm({ ...form, localisation: e.target.value })}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Logo</span>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                {form.logo ? (
                  <img src={form.logo} alt="" className="size-full object-contain p-1" />
                ) : (
                  <Building2 className="size-6 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void envoyerLogo(f);
                }}
                className="text-sm"
              />
            </div>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Description</span>
            <textarea
              rows={4}
              className={input}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSave()}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Patientez…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {liste.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Aucune entreprise pour le moment.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {liste.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                  {e.logo ? <img src={e.logo} alt="" className="size-full object-contain p-1" /> : <Building2 className="size-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold">{e.nom}</p>
                  <p className="text-sm text-muted-foreground">{e.localisation || "Localisation non renseignée"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ id: e.id, nom: e.nom, logo: e.logo, localisation: e.localisation, description: e.description });
                    setMsg("");
                  }}
                  className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={async () => {
                    await supprimer({ data: { id: e.id } });
                    await recharger();
                  }}
                  className="rounded-full border border-border px-3 py-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
