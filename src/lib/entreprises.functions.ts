import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchPublishedVehicles, publicClient, slugify } from "./vehicles.functions";

export type Entreprise = {
  id: string;
  slug: string;
  nom: string;
  logo: string;
  localisation: string;
  description: string;
};

const COLS = "id, slug, nom, logo, localisation, description";

export const listEntreprises = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("entreprises").select(COLS).order("nom");
  return (data ?? []) as Entreprise[];
});

export const getEntreprise = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { data: e } = await publicClient()
      .from("entreprises")
      .select(COLS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (!e) return null;
    const vehicules = (await fetchPublishedVehicles()).filter(
      (v) => v.entreprise?.slug === data.slug,
    );
    return { entreprise: e as Entreprise, vehicules };
  });

export const saveEntreprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        nom: z.string().min(1).max(120),
        logo: z.string().max(2000),
        localisation: z.string().max(300),
        description: z.string().max(3000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const q = id
      ? context.supabase.from("entreprises").update(rest).eq("id", id)
      : context.supabase
          .from("entreprises")
          .insert({ ...rest, slug: slugify(rest.nom) || `entreprise-${Date.now()}` });
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEntreprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("entreprises").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
