
-- Roles enum + table (separate per security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Articles
CREATE TYPE public.article_status AS ENUM ('draft', 'published', 'scheduled');

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content jsonb,
  content_html text,
  featured_image_url text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.article_status NOT NULL DEFAULT 'draft',
  publish_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  read_time integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE INDEX articles_status_idx ON public.articles(status);
CREATE INDEX articles_category_idx ON public.articles(category_id);
CREATE INDEX articles_publish_at_idx ON public.articles(publish_at DESC);

CREATE POLICY "Published articles public read" ON public.articles FOR SELECT
  USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));
CREATE POLICY "Admins read all articles" ON public.articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ticker
CREATE TABLE public.ticker_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticker_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active ticker public read" ON public.ticker_messages FOR SELECT USING (active = true);
CREATE POLICY "Admins manage ticker" ON public.ticker_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subscribers
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view subscribers" ON public.subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Comments (no login required)
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 80),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX comments_article_idx ON public.comments(article_id, created_at DESC);
CREATE POLICY "Comments public read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can comment" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins delete comments" ON public.comments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for article images
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);
CREATE POLICY "Article images public read" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');
CREATE POLICY "Admins upload article images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update article images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete article images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
