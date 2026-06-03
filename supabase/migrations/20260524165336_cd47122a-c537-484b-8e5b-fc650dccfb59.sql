
-- 1. Fix set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from public API roles
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role is still callable inside RLS policies because policies run as the table owner

-- 3. Replace permissive insert policies with content-validated ones
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255);

DROP POLICY IF EXISTS "Anyone can comment" ON public.comments;
CREATE POLICY "Anyone can comment" ON public.comments FOR INSERT
  WITH CHECK (
    char_length(trim(author_name)) BETWEEN 1 AND 80
    AND char_length(trim(body)) BETWEEN 1 AND 2000
  );

-- 4. Restrict article-image listing to admins (individual file fetches still work via public URLs)
DROP POLICY IF EXISTS "Article images public read" ON storage.objects;
CREATE POLICY "Article images admin list" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
