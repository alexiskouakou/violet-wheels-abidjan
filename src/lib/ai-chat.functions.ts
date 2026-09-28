import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { formatPrice, CONTACT_PHONE_DISPLAY } from "@/data/vehicles";
import { fetchPublishedVehicles } from "@/lib/vehicles.functions";

export const DAILY_LIMIT = 15;

const schema = z.object({
  sessionId: z.string().min(8).max(64),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
  vehicleId: z.string().optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) {
      return { reply: "L'assistant est momentanément indisponible. Contactez-nous sur WhatsApp.", restant: 0 };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const jour = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabaseAdmin
      .from("ai_chat_usage")
      .select("messages")
      .eq("session_id", data.sessionId)
      .eq("jour", jour)
      .maybeSingle();

    const dejaUtilises = (usage as { messages?: number } | null)?.messages ?? 0;
    if (dejaUtilises >= DAILY_LIMIT) {
      return {
        reply: `Vous avez atteint la limite de ${DAILY_LIMIT} messages pour aujourd'hui. Revenez demain ou contactez-nous directement par WhatsApp ou au ${CONTACT_PHONE_DISPLAY}.`,
        restant: 0,
      };
    }

    await supabaseAdmin
      .from("ai_chat_usage")
      .upsert(
        { session_id: data.sessionId, jour, messages: dejaUtilises + 1 } as never,
        { onConflict: "session_id,jour" },
      );
    const restant = DAILY_LIMIT - (dejaUtilises + 1);


    const vehicles = await fetchPublishedVehicles();
    const stock = vehicles
      .map(
        (v) =>
          `- ${v.nom} (${v.marque} ${v.modele}, ${v.annee}), ${v.categorie}, ${formatPrice(v.prix)}, ${v.kilometrage} km, ${v.carburant}, ${v.boite}, ${v.places} places, ${v.ville}. Lien: /vehicules/${v.id}`,
      )
      .join("\n");

    const current = data.vehicleId
      ? vehicles.find((v) => v.id === data.vehicleId)
      : undefined;

    const system = `Tu es le conseiller commercial de Zoom Auto, un vendeur de véhicules à Abidjan (Côte d'Ivoire).
Réponds toujours en français, de façon courte, concrète et chaleureuse. Prix en FCFA.
Tu peux conseiller un véhicule du stock, comparer, expliquer la démarche d'achat (carte grise, mutation, essai) et inviter à contacter le ${CONTACT_PHONE_DISPLAY} ou WhatsApp.
N'invente jamais un véhicule qui n'est pas dans le stock.

Stock disponible :
${stock}
${current ? `\nL'utilisateur consulte actuellement : ${current.nom} (${current.annee}) à ${formatPrice(current.prix)}. ${current.description}` : ""}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://violet-wheels-abidjan.lovable.app",
        "X-Title": "Zoom Auto",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (res.status === 429) {
      return { reply: "Trop de demandes en ce moment, réessayez dans un instant.", restant };
    }
    if (res.status === 402) {
      return { reply: "L'assistant est temporairement indisponible. Écrivez-nous sur WhatsApp.", restant };
    }
    if (!res.ok) {
      return { reply: "Désolé, une erreur est survenue. Réessayez ou contactez-nous par téléphone.", restant };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      reply:
        json.choices?.[0]?.message?.content ??
        "Je n'ai pas compris, pouvez-vous reformuler ?",
      restant,
    };
  });
