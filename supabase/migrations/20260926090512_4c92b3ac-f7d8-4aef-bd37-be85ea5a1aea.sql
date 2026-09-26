CREATE TABLE public.entreprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nom text NOT NULL,
  logo text NOT NULL DEFAULT '',
  localisation text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entreprises TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entreprises TO authenticated;
GRANT ALL ON public.entreprises TO service_role;
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entreprises publiques" ON public.entreprises FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert entreprises" ON public.entreprises FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update entreprises" ON public.entreprises FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete entreprises" ON public.entreprises FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.vehicules
  ADD COLUMN entreprise_id uuid REFERENCES public.entreprises(id) ON DELETE SET NULL,
  ADD COLUMN condition text NOT NULL DEFAULT 'Occasion';

CREATE POLICY "Logos publics" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Admins upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos' AND public.is_admin());
CREATE POLICY "Admins update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos' AND public.is_admin());
CREATE POLICY "Admins delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos' AND public.is_admin());