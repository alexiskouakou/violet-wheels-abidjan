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
  condition?: string;
  entreprises?: { slug: string; nom: string; logo: string } | null;
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
  condition: r.condition ?? "Occasion",
  entreprise: r.entreprises ?? null,
});

const SELECT = "*, entreprises(slug, nom, logo)";

export function publicClient() {
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
  return fetchPublishedVehicles();
});

export async function fetchPublishedVehicles(): Promise<DbVehicle[]> {
  const { data, error } = await publicClient()
    .from("vehicules")
    .select(SELECT)
    .eq("publie", true)
    .order("created_at", { ascending: false });
  if (error) return [] as DbVehicle[];
  return ((data ?? []) as Row[]).map(toVehicle);
}

export const getPublishedVehicle = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("vehicules")
      .select(SELECT)
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
      .select(SELECT)
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
  entreprise: z.string().default(""),
  condition: z.string().default("Occasion"),
});

export type Fiche = z.infer<typeof ficheSchema>;

export const generateFiche = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().min(5).max(600) }).parse(d),
  )
  .handler(async ({ data }) => {
    console.log("[FICHE] Handler appelé avec prompt:", data.prompt);
    const apiKey = process.env["OPENROUTER_API_KEY"];
    console.log("[FICHE] OPENROUTER_API_KEY défini:", !!apiKey);
    if (!apiKey) throw new Error("Assistant indisponible");

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const body = JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `Tu es expert automobile pour un concessionnaire à Abidjan (Côte d'Ivoire).
À partir d'une description courte, produis une fiche technique complète et réaliste en français.
Prix en FCFA (nombre entier, sans espaces). Slug en minuscules avec des tirets.
categorie parmi: SUV, Berline, Pick-up, Citadine. carburant parmi: Essence, Diesel. boite parmi: Automatique, Manuelle.
entreprise = nom de l'entreprise qui vend le véhicule UNIQUEMENT si elle est mentionnée (ex: "entreprise : CFAO"), sinon chaîne vide. condition parmi: Neuf, Occasion (Neuf si le véhicule est dit neuf/0 km).
Si une information manque, propose une valeur plausible pour ce modèle.
Réponds UNIQUEMENT par un objet JSON avec les clés: slug, nom, marque, modele, annee, prix, categorie, image, kilometrage, carburant, boite, places, portes, moteur, puissance, transmission, couleur, etat, ville, description, equipements (tableau de 5 à 8 textes), entreprise, condition. image = chaîne vide.`,
        },
        { role: "user", content: data.prompt },
      ],
      response_format: { type: "json_object" },
    });

    console.log("[FICHE] Tentative d'appel OpenRouter...");
    console.log("[FICHE] URL:", url);
    console.log("[FICHE] API Key (10 premiers caractères):", apiKey.slice(0, 10) + "...");
    console.log("[FICHE] Model:", "google/gemini-2.5-flash-lite");
    console.log("[FICHE] Prompt:", data.prompt);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://violet-wheels-abidjan.lovable.app",
        "X-Title": "Zoom Auto",
      },
      body,
    });

    console.log("[FICHE] Réponse reçue - Status:", res.status);
    console.log("[FICHE] Headers de réponse:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[FICHE] Erreur OpenRouter:", errorText);
      throw new Error("Génération impossible pour le moment");
    }
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
    const { entreprise, ...fiche } = data.fiche;
    let entreprise_id: string | null = null;
    const nomE = entreprise.trim();
    if (nomE) {
      const { data: found } = await context.supabase
        .from("entreprises").select("id").ilike("nom", nomE).maybeSingle();
      if (found) entreprise_id = found.id;
      else {
        const slug = slugify(nomE) || `entreprise-${Date.now()}`;
        const { data: created, error: e } = await context.supabase
          .from("entreprises").insert({ nom: nomE, slug }).select("id").single();
        if (e) throw new Error(e.message);
        entreprise_id = created.id;
      }
    }
    const payload = { ...fiche, entreprise_id, publie: data.publie };
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

export const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
