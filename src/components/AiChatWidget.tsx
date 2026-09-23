import { useState, useRef, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askAssistant } from "@/lib/ai-chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "autoivoire-session-id";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function AiChatWidget() {
  const params = useParams({ strict: false }) as { id?: string };
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [restant, setRestant] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis l'assistant AutoIvoire. Posez-moi vos questions sur un véhicule, un budget ou les démarches d'achat à Abidjan.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  const bloque = restant !== null && restant <= 0;

  const send = async () => {
    const text = input.trim();
    if (!text || loading || bloque) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: {
          sessionId: getSessionId(),
          messages: next.slice(-20).map((m) => ({ role: m.role, content: m.content })),
          ...(params.id ? { vehicleId: params.id } : {}),
        },
      });
      setRestant(res.restant);
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Connexion impossible pour le moment. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card"
        >
          <Bot className="size-4" aria-hidden="true" />
          Discuter avec l'IA
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-40 flex h-[32rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Bot className="size-4 text-primary" aria-hidden="true" /> Assistant AutoIvoire
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer la discussion"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-muted-foreground">L'assistant écrit…</p>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="border-t border-border p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={bloque}
                placeholder={bloque ? "Limite du jour atteinte" : "Votre question…"}
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || bloque}
                aria-label="Envoyer"
                className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
            {restant !== null && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {restant > 0
                  ? `${restant} message${restant > 1 ? "s" : ""} restant${restant > 1 ? "s" : ""} aujourd'hui`
                  : "Limite de 15 messages par jour atteinte"}
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
}
