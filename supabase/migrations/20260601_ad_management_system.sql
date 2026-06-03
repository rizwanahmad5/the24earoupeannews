-- Create advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('adsense', 'custom', 'sponsored', 'other')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  ad_slot text NOT NULL CHECK (ad_slot IN ('header_banner', 'mid_page', 'sidebar', 'footer_banner', 'mid_article', 'end_article')),
  ad_size text NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  
  -- Custom / Sponsored fields
  image_url text,
  target_url text,
  html_content text,
  
  -- AdSense fields
  adsense_client_id text,
  adsense_slot_id text,
  
  -- Analytics
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Public read policy (only active, scheduled advertisements)
CREATE POLICY "Public read active advertisements" ON public.advertisements
  FOR SELECT USING (
    status = 'active' 
    AND (start_date IS NULL OR start_date <= now()) 
    AND (end_date IS NULL OR end_date >= now())
  );

-- Admin full management policy
CREATE POLICY "Admins manage advertisements" ON public.advertisements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER advertisements_updated_at BEFORE UPDATE ON public.advertisements 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RPC function to increment ad impressions or clicks securely
CREATE OR REPLACE FUNCTION public.track_ad_event(ad_id uuid, event_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF event_type = 'impression' THEN
    UPDATE public.advertisements SET impressions = impressions + 1 WHERE id = ad_id;
  ELSIF event_type = 'click' THEN
    UPDATE public.advertisements SET clicks = clicks + 1 WHERE id = ad_id;
  END IF;
END;
$$;
