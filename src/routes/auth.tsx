import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion espace vendeur — Zoom Auto" },
      { name: "description", content: "Accès réservé à l'équipe Zoom Auto pour gérer les véhicules en vente à Abidjan." },
      { property: "og:title", content: "Connexion espace vendeur — Zoom Auto" },
      { property: "og:description", content: "Accès réservé à l'équipe Zoom Auto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + "/admin" },
          });
    setLoading(false);
    if (error) {
      console.error("[AUTH] Erreur complète:", error);
      console.error("[AUTH] Message:", error.message);
      console.error("[AUTH] Code:", (error as { code?: string }).code);
      console.error("[AUTH] Stack:", error.stack);
      setErreur(
        error.message.includes("Invalid login")
          ? "E-mail ou mot de passe incorrect."
          : error.message,
      );
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) navigate({ to: "/admin" });
    else setErreur("Compte créé. Connectez-vous maintenant.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-card"
      >
        <Link to="/" aria-label="Accueil Zoom Auto">
          <BrandLogo className="h-10 w-auto max-w-44 object-contain" />
        </Link>
        <h1 className="mt-4 text-xl font-bold">
          {mode === "login" ? "Connexion espace vendeur" : "Créer le compte vendeur"}
        </h1>

        <label className="mt-5 block text-sm font-medium">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />

        <label className="mt-4 block text-sm font-medium">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />

        {erreur && <p className="mt-3 text-sm text-destructive">{erreur}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer le compte"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "login"
            ? "Première connexion ? Créer le compte"
            : "J'ai déjà un compte, me connecter"}
        </button>
      </form>
    </main>
  );
}
