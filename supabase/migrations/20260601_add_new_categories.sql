-- Add new categories: Health, Politics, Entertainment, International News
-- Also split "Business & Finance" into separate "Business" and "Finance"

INSERT INTO categories (name, slug) VALUES ('Health', 'health') ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Politics', 'politics') ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Entertainment', 'entertainment') ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('International News', 'international-news') ON CONFLICT (slug) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Finance', 'finance') ON CONFLICT (slug) DO NOTHING;
