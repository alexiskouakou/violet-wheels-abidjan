import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/vehicles";
import {
  generateFiche,
  listAdminVehicles,
  saveVehicle,
  deleteVehicle,
  type Fiche,
  type DbVehicle,
} from "@/lib/vehicles.functions";
import { EntreprisesAdmin } from "@/components/EntreprisesAdmin";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Espace vendeur — Zoom Auto" },
      { name: "description", content: "Ajoutez un véhicule : l'IA remplit la fiche technique, vous validez avant publication." },
      { property: "og:title", content: "Espace vendeur — Zoom Auto" },
      { property: "og:description", content: "Gestion des véhicules en vente à Abidjan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const CHAMPS: [keyof Fiche, string, "text" | "number"][] = [
  ["nom", "Nom affiché", "text"],
  ["slug", "Identifiant (URL)", "text"],
  ["marque", "Marque", "text"],
  ["modele", "Modèle", "text"],
  ["annee", "Année", "number"],
  ["prix", "Prix (FCFA)", "number"],
  ["categorie", "Catégorie", "text"],
  ["kilometrage", "Kilométrage", "number"],
  ["carburant", "Carburant", "text"],
  ["boite", "Boîte de vitesses", "text"],
  ["moteur", "Moteur", "text"],
  ["puissance", "Puissance", "text"],
  ["transmission", "Transmission", "text"],
  ["places", "Places", "number"],
  ["portes", "Portes", "number"],
  ["couleur", "Couleur", "text"],
  ["etat", "État", "text"],
  ["ville", "Localisation", "text"],
  ["image", "Lien de la photo", "text"],
  ["entreprise", "Entreprise qui vend (ex : CFAO)", "text"],
];

function AdminPage() {
  const navigate = useNavigate();
  const generer = useServerFn(generateFiche);
  const lister = useServerFn(listAdminVehicles);
  const enregistrer = useServerFn(saveVehicle);
  const supprimer = useServerFn(deleteVehicle);

  const [prompt, setPrompt] = useState("");
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [dbId, setDbId] = useState<string | undefined>(undefined);
  const [liste, setListe] = useState<DbVehicle[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [entreprisesKey, setEntreprisesKey] = useState(0);

  const recharger = async () => {
    try {
      setListe(await lister({}));
    } catch {
      setMessage("Accès refusé : ce compte n'est pas administrateur.");
    }
  };

  useEffect(() => {
    void recharger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGenerer = async () => {
    if (prompt.trim().length < 5) return;
    setBusy(true);
    setMessage("");
    try {
      const f = await generer({ data: { prompt: prompt.trim() } });
      setFiche(f);
      setDbId(undefined);
    } catch {
      setMessage("La génération a échoué. Reformulez la description et réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const onEnregistrer = async (publie: boolean) => {
    if (!fiche) return;
    setBusy(true);
    setMessage("");
    try {
      await enregistrer({ data: { fiche, publie, ...(dbId ? { dbId } : {}) } });
      setMessage(publie ? "Véhicule publié sur le site." : "Brouillon enregistré.");
      setFiche(null);
      setDbId(undefined);
      setPrompt("");
      await recharger();
      setEntreprisesKey((k) => k + 1);
    } catch {
      setMessage("Enregistrement impossible. Vérifiez que l'identifiant (URL) est unique.");
    } finally {
      setBusy(false);
    }
  };

  const deconnexion = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" aria-label="Accueil Zoom Auto">
            <BrandLogo className="h-9 w-auto max-w-40 object-contain" />
          </Link>
          <button
            type="button"
            onClick={() => void deconnexion()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Ajouter un véhicule</h1>
        <p className="mt-2 text-muted-foreground">
          Décrivez le véhicule en une phrase, l'assistant remplit la fiche technique.
          Vous la relisez et la corrigez avant publication.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ex : Chery TIGGO 3X 1.5 L, traction avant, neuve, noire, 15.000.000f"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={() => void onGenerer()}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Sparkles className="size-4" />
            {busy ? "Génération…" : "Générer la fiche technique"}
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">{message}</p>
        )}

        {fiche && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="text-xl font-bold">Vérifiez la fiche avant publication</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {CHAMPS.map(([cle, label, type]) => (
                <label key={cle} className="block text-sm">
                  <span className="font-medium">{label}</span>
                  <input
                    type={type}
                    value={String(fiche[cle] ?? "")}
                    onChange={(e) =>
                      setFiche({
                        ...fiche,
                        [cle]: type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block text-sm">
              <span className="font-medium">Neuf ou occasion</span>
              <select
                value={fiche.condition}
                onChange={(e) => setFiche({ ...fiche, condition: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option>Neuf</option>
                <option>Occasion</option>
              </select>
            </label>

            <label className="mt-4 block text-sm">
              <span className="font-medium">Description</span>
              <textarea
                rows={4}
                value={fiche.description}
                onChange={(e) => setFiche({ ...fiche, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="mt-4 block text-sm">
              <span className="font-medium">Équipements (un par ligne)</span>
              <textarea
                rows={6}
                value={fiche.equipements.join("\n")}
                onChange={(e) =>
                  setFiche({
                    ...fiche,
                    equipements: e.target.value.split("\n").filter((l) => l.trim() !== ""),
                  })
                }
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onEnregistrer(true)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                Publier sur le site
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onEnregistrer(false)}
                className="rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-60"
              >
                Enregistrer en brouillon
              </button>
              <button
                type="button"
                onClick={() => {
                  setFiche(null);
                  setDbId(undefined);
                }}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                Annuler
              </button>
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-bold">Véhicules enregistrés</h2>
          {liste.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucun véhicule enregistré pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {liste.map((v) => (
                <li
                  key={v.dbId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {v.nom}{" "}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          v.publie ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {v.publie ? "Publié" : "Brouillon"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {v.annee} · {formatPrice(v.prix)} · {v.categorie}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const { dbId: _id, publie: _p, entreprise: _e, ...rest } = v;
                        setFiche({
                          ...rest,
                          slug: v.id,
                          entreprise: v.entreprise?.nom ?? "",
                          condition: v.condition ?? "Occasion",
                        } as Fiche);
                        setDbId(v.dbId);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await supprimer({ data: { dbId: v.dbId } });
                        await recharger();
                      }}
                      aria-label="Supprimer"
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

        <EntreprisesAdmin key={entreprisesKey} />
      </div>
    </main>
  );
}
