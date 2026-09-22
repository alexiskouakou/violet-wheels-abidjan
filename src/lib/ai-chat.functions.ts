import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { vehicles, formatPrice, CONTACT_PHONE_DISPLAY } from "@/data/vehicles";

const schema = z.object({
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
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { reply: "L'assistant est momentanément indisponible. Contactez-nous sur WhatsApp." };
    }

    const stock = vehicles
      .map(
        (v) =>
          `- ${v.nom} (${v.marque} ${v.modele}, ${v.annee}), ${v.categorie}, ${formatPrice(v.prix)}, ${v.kilometrage} km, ${v.carburant}, ${v.boite}, ${v.places} places, ${v.ville}. Lien: /vehicules/${v.id}`,
      )
      .join("\n");

    const current = data.vehicleId
      ? vehicles.find((v) => v.id === data.vehicleId)
      : undefined;

    const system = `Tu es le conseiller commercial d'AutoIvoire, un vendeur de véhicules à Abidjan (Côte d'Ivoire).
Réponds toujours en français, de façon courte, concrète et chaleureuse. Prix en FCFA.
Tu peux conseiller un véhicule du stock, comparer, expliquer la démarche d'achat (carte grise, mutation, essai) et inviter à contacter le ${CONTACT_PHONE_DISPLAY} ou WhatsApp.
N'invente jamais un véhicule qui n'est pas dans le stock.

Stock disponible :
${stock}
${current ? `\nL'utilisateur consulte actuellement : ${current.nom} (${current.annee}) à ${formatPrice(current.prix)}. ${current.description}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (res.status === 429) {
      return { reply: "Trop de demandes en ce moment, réessayez dans un instant." };
    }
    if (res.status === 402) {
      return { reply: "L'assistant est temporairement indisponible. Écrivez-nous sur WhatsApp." };
    }
    if (!res.ok) {
      return { reply: "Désolé, une erreur est survenue. Réessayez ou contactez-nous par téléphone." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      reply:
        json.choices?.[0]?.message?.content ??
        "Je n'ai pas compris, pouvez-vous reformuler ?",
    };
  });
