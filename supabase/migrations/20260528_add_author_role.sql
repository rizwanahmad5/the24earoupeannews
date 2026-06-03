-- Add 'author' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'author';

-- Authors can read their own articles
CREATE POLICY "Authors read own articles" ON public.articles
  FOR SELECT TO authenticated
  USING (author_id = auth.uid() AND public.has_role(auth.uid(), 'author'));

-- Authors can insert articles (must set author_id = themselves)
CREATE POLICY "Authors insert articles" ON public.articles
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.has_role(auth.uid(), 'author'));

-- Authors can update their own articles only
CREATE POLICY "Authors update own articles" ON public.articles
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND public.has_role(auth.uid(), 'author'))
  WITH CHECK (author_id = auth.uid() AND public.has_role(auth.uid(), 'author'));

-- Authors can upload images to storage
CREATE POLICY "Authors upload article images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'author'));

-- Admins can read ALL user_roles (needed for user management page)
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can read all profiles (needed for user management)
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any profile
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can insert profiles (for new users)
CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authors can read categories (needed for article editor dropdown)
-- Already covered by "Categories public read" policy
