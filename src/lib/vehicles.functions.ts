import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Vehicle } from "@/data/vehicles";

export type DbVehicle = Vehicle & { publie: boolean; dbId: string };

type Row = {
  id: string;
  slug: string;
  nom: string;
  marque: string;
  modele: string;
  annee: number;
  prix: number;
  categorie: string;
  image: string;
  kilometrage: number;
  carburant: string;
  boite: string;
  places: number;
  portes: number;
  moteur: string;
  puissance: string;
  transmission: string;
  couleur: string;
  etat: string;
  ville: string;
  description: string;
  equipements: string[];
  publie: boolean;
};

const toVehicle = (r: Row): DbVehicle => ({
  dbId: r.id,
  id: r.slug,
  nom: r.nom,
  marque: r.marque,
  modele: r.modele,
  annee: r.annee,
  prix: Number(r.prix),
  categorie: (r.categorie as Vehicle["categorie"]) ?? "Berline",
  image: r.image,
  kilometrage: r.kilometrage,
  carburant: r.carburant,
  boite: r.boite,
  places: r.places,
  portes: r.portes,
  moteur: r.moteur,
  puissance: r.puissance,
  transmission: r.transmission,
  couleur: r.couleur,
  etat: r.etat,
  ville: r.ville,
  description: r.description,
  equipements: r.equipements ?? [],
  publie: r.publie,
});

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPublishedVehicles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("vehicules")
    .select("*")
    .eq("publie", true)
    .order("created_at", { ascending: false });
  if (error) return [] as DbVehicle[];
  return ((data ?? []) as Row[]).map(toVehicle);
});

export const getPublishedVehicle = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("vehicules")
      .select("*")
      .eq("slug", data.slug)
      .eq("publie", true)
      .maybeSingle();
    if (error || !row) return null;
    return toVehicle(row as Row);
  });

export const listAdminVehicles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("vehicules")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Row[]).map(toVehicle);
  });

const ficheSchema = z.object({
  slug: z.string().min(1),
  nom: z.string().min(1),
  marque: z.string(),
  modele: z.string(),
  annee: z.number(),
  prix: z.number(),
  categorie: z.string(),
  image: z.string(),
  kilometrage: z.number(),
  carburant: z.string(),
  boite: z.string(),
  places: z.number(),
  portes: z.number(),
  moteur: z.string(),
  puissance: z.string(),
  transmission: z.string(),
  couleur: z.string(),
  etat: z.string(),
  ville: z.string(),
  description: z.string(),
  equipements: z.array(z.string()),
});

export type Fiche = z.infer<typeof ficheSchema>;

export const generateFiche = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().min(5).max(600) }).parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistant indisponible");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content: `Tu es expert automobile pour un concessionnaire à Abidjan (Côte d'Ivoire).
À partir d'une description courte, produis une fiche technique complète et réaliste en français.
Prix en FCFA (nombre entier, sans espaces). Slug en minuscules avec des tirets.
categorie parmi: SUV, Berline, Pick-up, Citadine. carburant parmi: Essence, Diesel. boite parmi: Automatique, Manuelle.
Si une information manque, propose une valeur plausible pour ce modèle.
Réponds UNIQUEMENT par un objet JSON avec les clés: slug, nom, marque, modele, annee, prix, categorie, image, kilometrage, carburant, boite, places, portes, moteur, puissance, transmission, couleur, etat, ville, description, equipements (tableau de 5 à 8 textes). image = chaîne vide.`,
          },
          { role: "user", content: data.prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) throw new Error("Génération impossible pour le moment");
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/^```json|```$/g, "").trim()) as unknown;
    return ficheSchema.parse(parsed);
  });

export const saveVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        dbId: z.string().optional(),
        publie: z.boolean(),
        fiche: ficheSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = { ...data.fiche, publie: data.publie };
    const query = data.dbId
      ? context.supabase.from("vehicules").update(payload as never).eq("id", data.dbId)
      : context.supabase.from("vehicules").insert(payload as never);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ dbId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("vehicules").delete().eq("id", data.dbId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_admin" as never);
    return { admin: data === true };
  });
