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
    console.error("[AI-CHAT] ========================================");
    console.error("[AI-CHAT] HANDLER START");
    console.error("[AI-CHAT] ========================================");

    try {
      console.error("[AI-CHAT] Session:", `${data.sessionId.slice(0, 8)}...`);
      console.error("[AI-CHAT] Messages:", data.messages.length);
      console.error("[AI-CHAT] Vehicle ID:", data.vehicleId ?? "none");

      // ---------------------------------------------------------
      // 1. Vérification de la clé OpenRouter
      // ---------------------------------------------------------

      const apiKey = process.env["OPENROUTER_API_KEY"];

      console.error(
        "[AI-CHAT] OPENROUTER_API_KEY présente:",
        Boolean(apiKey),
      );

      if (!apiKey) {
        console.error(
          "[AI-CHAT] ERREUR: OPENROUTER_API_KEY absente du runtime serveur",
        );

        return {
          reply:
            "L'assistant est momentanément indisponible. Contactez-nous sur WhatsApp.",
          restant: 0,
        };
      }

      // ---------------------------------------------------------
      // 2. Connexion Supabase Admin
      // ---------------------------------------------------------

      console.error("[AI-CHAT] Import du client Supabase...");

      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");

      console.error("[AI-CHAT] Client Supabase importé");

      const jour = new Date().toISOString().slice(0, 10);

      // ---------------------------------------------------------
      // 3. Lecture de la consommation IA
      // ---------------------------------------------------------

      console.error("[AI-CHAT] Lecture de ai_chat_usage...");

      const { data: usage, error: usageError } = await supabaseAdmin
        .from("ai_chat_usage")
        .select("messages")
        .eq("session_id", data.sessionId)
        .eq("jour", jour)
        .maybeSingle();

      if (usageError) {
        console.error("[AI-CHAT] ERREUR Supabase SELECT:");
        console.error("[AI-CHAT] message:", usageError.message);
        console.error("[AI-CHAT] code:", usageError.code);
        console.error("[AI-CHAT] details:", usageError.details);
        console.error("[AI-CHAT] hint:", usageError.hint);

        throw usageError;
      }

      console.error("[AI-CHAT] Usage récupéré:", usage);

      const dejaUtilises =
        (usage as { messages?: number } | null)?.messages ?? 0;

      console.error(
        "[AI-CHAT] Messages déjà utilisés:",
        dejaUtilises,
      );

      // ---------------------------------------------------------
      // 4. Limite quotidienne
      // ---------------------------------------------------------

      if (dejaUtilises >= DAILY_LIMIT) {
        console.error("[AI-CHAT] Limite quotidienne atteinte");

        return {
          reply: `Vous avez atteint la limite de ${DAILY_LIMIT} messages pour aujourd'hui. Revenez demain ou contactez-nous directement par WhatsApp ou au ${CONTACT_PHONE_DISPLAY}.`,
          restant: 0,
        };
      }

      // ---------------------------------------------------------
      // 5. Incrémentation du compteur
      // ---------------------------------------------------------

      console.error("[AI-CHAT] Mise à jour du compteur...");

      const { error: upsertError } = await supabaseAdmin
        .from("ai_chat_usage")
        .upsert(
          {
            session_id: data.sessionId,
            jour,
            messages: dejaUtilises + 1,
          } as never,
          {
            onConflict: "session_id,jour",
          },
        );

      if (upsertError) {
        console.error("[AI-CHAT] ERREUR Supabase UPSERT:");
        console.error("[AI-CHAT] message:", upsertError.message);
        console.error("[AI-CHAT] code:", upsertError.code);
        console.error("[AI-CHAT] details:", upsertError.details);
        console.error("[AI-CHAT] hint:", upsertError.hint);

        throw upsertError;
      }

      console.error("[AI-CHAT] Compteur mis à jour");

      const restant = DAILY_LIMIT - (dejaUtilises + 1);

      // ---------------------------------------------------------
      // 6. Récupération des véhicules
      // ---------------------------------------------------------

      console.error("[AI-CHAT] Récupération des véhicules...");

      const vehicles = await fetchPublishedVehicles();

      console.error(
        "[AI-CHAT] Véhicules récupérés:",
        vehicles.length,
      );

      // ---------------------------------------------------------
      // 7. Construction du stock
      // ---------------------------------------------------------

      const stock = vehicles
        .map(
          (v) =>
            `- ${v.nom} (${v.marque} ${v.modele}, ${v.annee}), ${v.categorie}, ${formatPrice(v.prix)}, ${v.kilometrage} km, ${v.carburant}, ${v.boite}, ${v.places} places, ${v.ville}. Lien: /vehicules/${v.id}`,
        )
        .join("\n");

      const current = data.vehicleId
        ? vehicles.find((v) => v.id === data.vehicleId)
        : undefined;

      console.error(
        "[AI-CHAT] Véhicule actuellement consulté:",
        current?.nom ?? "aucun",
      );

      // ---------------------------------------------------------
      // 8. Prompt système
      // ---------------------------------------------------------

      const system = `Tu es le conseiller commercial de Zoom Auto, un vendeur de véhicules à Abidjan (Côte d'Ivoire).
Réponds toujours en français, de façon courte, concrète et chaleureuse. Prix en FCFA.
Tu peux conseiller un véhicule du stock, comparer, expliquer la démarche d'achat (carte grise, mutation, essai) et inviter à contacter le ${CONTACT_PHONE_DISPLAY} ou WhatsApp.
N'invente jamais un véhicule qui n'est pas dans le stock.

Stock disponible :
${stock}
${current ? `\nL'utilisateur consulte actuellement : ${current.nom} (${current.annee}) à ${formatPrice(current.prix)}. ${current.description}` : ""}`;

      // ---------------------------------------------------------
      // 9. Préparation OpenRouter
      // ---------------------------------------------------------

      const url = "https://openrouter.ai/api/v1/chat/completions";

      const body = JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: system,
          },
          ...data.messages,
        ],
      });

      console.error("[AI-CHAT] ========================================");
      console.error("[AI-CHAT] APPEL OPENROUTER");
      console.error("[AI-CHAT] ========================================");

      console.error("[AI-CHAT] URL:", url);
      console.error("[AI-CHAT] Model:", "google/gemini-2.5-flash-lite");
      console.error("[AI-CHAT] Messages:", data.messages.length);
      console.error("[AI-CHAT] API key présente:", Boolean(apiKey));

      // ---------------------------------------------------------
      // 10. Appel OpenRouter
      // ---------------------------------------------------------

      let res: Response;

      try {
        res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://zoomauto.vercel.app",
            "X-Title": "Zoom Auto",
          },
          body,
        });
      } catch (fetchError) {
        console.error("[AI-CHAT] ERREUR FETCH OPENROUTER");

        if (fetchError instanceof Error) {
          console.error("[AI-CHAT] message:", fetchError.message);
          console.error("[AI-CHAT] stack:", fetchError.stack);
        } else {
          console.error("[AI-CHAT] erreur:", fetchError);
        }

        throw fetchError;
      }

      // ---------------------------------------------------------
      // 11. Lecture de la réponse OpenRouter
      // ---------------------------------------------------------

      console.error(
        "[AI-CHAT] OpenRouter HTTP status:",
        res.status,
      );

      console.error(
        "[AI-CHAT] OpenRouter status text:",
        res.statusText,
      );

      console.error(
        "[AI-CHAT] OpenRouter headers:",
        Object.fromEntries(res.headers.entries()),
      );

      const responseText = await res.text();

      console.error(
        "[AI-CHAT] OpenRouter response:",
        responseText.slice(0, 3000),
      );

      // ---------------------------------------------------------
      // 12. Gestion des erreurs OpenRouter
      // ---------------------------------------------------------

      if (res.status === 429) {
        console.error("[AI-CHAT] OpenRouter: RATE LIMIT 429");

        return {
          reply:
            "Trop de demandes en ce moment, réessayez dans un instant.",
          restant,
        };
      }

      if (res.status === 402) {
        console.error("[AI-CHAT] OpenRouter: PAYMENT REQUIRED 402");

        return {
          reply:
            "L'assistant est temporairement indisponible. Écrivez-nous sur WhatsApp.",
          restant,
        };
      }

      if (!res.ok) {
        console.error("[AI-CHAT] ========================================");
        console.error("[AI-CHAT] ERREUR OPENROUTER");
        console.error("[AI-CHAT] Status:", res.status);
        console.error("[AI-CHAT] Response:", responseText.slice(0, 3000));
        console.error("[AI-CHAT] ========================================");

        return {
          reply:
            "Désolé, une erreur est survenue. Réessayez ou contactez-nous par téléphone.",
          restant,
        };
      }

      // ---------------------------------------------------------
      // 13. Parsing de la réponse
      // ---------------------------------------------------------

      let json: {
        choices?: {
          message?: {
            content?: string;
          };
        }[];
      };

      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "[AI-CHAT] ERREUR PARSING JSON OPENROUTER:",
          parseError,
        );

        throw parseError;
      }

      const reply = json.choices?.[0]?.message?.content;

      console.error(
        "[AI-CHAT] Réponse IA:",
        reply?.slice(0, 500) ?? "Aucune réponse",
      );

      console.error("[AI-CHAT] ========================================");
      console.error("[AI-CHAT] SUCCÈS");
      console.error("[AI-CHAT] ========================================");

      return {
        reply:
          reply ?? "Je n'ai pas compris, pouvez-vous reformuler ?",
        restant,
      };
    } catch (error) {
      // ---------------------------------------------------------
      // ERREUR GLOBALE
      // ---------------------------------------------------------

      console.error("[AI-CHAT] ========================================");
      console.error("[AI-CHAT] ERREUR FATALE DANS LE HANDLER");
      console.error("[AI-CHAT] ========================================");

      if (error instanceof Error) {
        console.error("[AI-CHAT] Name:", error.name);
        console.error("[AI-CHAT] Message:", error.message);
        console.error("[AI-CHAT] Stack:", error.stack);
      } else {
        console.error("[AI-CHAT] Error:", error);
      }

      throw error;
    }
  });