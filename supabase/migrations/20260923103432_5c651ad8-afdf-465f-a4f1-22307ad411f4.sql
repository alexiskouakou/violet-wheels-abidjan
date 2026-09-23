CREATE TABLE public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see the admin list" ON public.admin_emails FOR SELECT TO authenticated USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

INSERT INTO public.admin_emails (email) VALUES ('alexykouakou01@gmail.com');

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

CREATE TABLE public.vehicules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nom text NOT NULL,
  marque text NOT NULL DEFAULT '',
  modele text NOT NULL DEFAULT '',
  annee integer NOT NULL DEFAULT 2020,
  prix bigint NOT NULL DEFAULT 0,
  categorie text NOT NULL DEFAULT 'Berline',
  image text NOT NULL DEFAULT '',
  kilometrage integer NOT NULL DEFAULT 0,
  carburant text NOT NULL DEFAULT 'Essence',
  boite text NOT NULL DEFAULT 'Manuelle',
  places integer NOT NULL DEFAULT 5,
  portes integer NOT NULL DEFAULT 5,
  moteur text NOT NULL DEFAULT '',
  puissance text NOT NULL DEFAULT '',
  transmission text NOT NULL DEFAULT '',
  couleur text NOT NULL DEFAULT '',
  etat text NOT NULL DEFAULT '',
  ville text NOT NULL DEFAULT 'Abidjan',
  description text NOT NULL DEFAULT '',
  equipements text[] NOT NULL DEFAULT '{}',
  publie boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicules TO authenticated;
GRANT ALL ON public.vehicules TO service_role;
ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published vehicles are public" ON public.vehicules FOR SELECT TO anon, authenticated USING (publie = true);
CREATE POLICY "Admins can read all vehicles" ON public.vehicules FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert vehicles" ON public.vehicules FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update vehicles" ON public.vehicules FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete vehicles" ON public.vehicules FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.ai_chat_usage (
  session_id text NOT NULL,
  jour date NOT NULL DEFAULT current_date,
  messages integer NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, jour)
);
GRANT ALL ON public.ai_chat_usage TO service_role;
ALTER TABLE public.ai_chat_usage ENABLE ROW LEVEL SECURITY;