import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";
import { CardCarousel } from "@/components/CardCarousel";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { formatDate } from "@/lib/format";
import { CATEGORY_SECTIONS, DUMMY_ARTICLES } from "@/lib/dummyData";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "The 24 European News — Premium News, Tech, Business & Lifestyle" },
      { name: "description", content: "Cinematic reporting on the stories shaping tomorrow. News, Tech & AI, Lifestyle, Business, Finance." },
      { property: "og:title", content: "The 24 European News — Premium News & Culture" },
      { property: "og:description", content: "Cinematic reporting on the stories shaping tomorrow." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  const [heroArticles, setHeroArticles] = useState<ArticleCardData[]>([]);
  const [trending, setTrending] = useState<ArticleCardData[]>([]);
  const [bySection, setBySection] = useState<Record<string, ArticleCardData[]>>({});

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, publish_at, created_at, read_time, views, category:categories(name, slug)")
        .eq("status", "published")
        .order("publish_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(40);

      const list = (data && data.length ? data : DUMMY_ARTICLES) as unknown as (ArticleCardData & { views: number })[];
      setHeroArticles(list.slice(0, 5));
      setTrending([...list].sort((a, b) => b.views - a.views).slice(0, 5));

      const map: Record<string, ArticleCardData[]> = {};
      for (const a of list) {
        const slug = a.category?.slug;
        if (!slug) continue;
        (map[slug] ||= []).push(a);
      }
      setBySection(map);
    })();
  }, []);

  // Hero auto-slide
  const heroNext = useCallback(() => {
    setHeroIndex((prev) => (prev >= heroArticles.length - 1 ? 0 : prev + 1));
  }, [heroArticles.length]);

  const heroPrev = useCallback(() => {
    setHeroIndex((prev) => (prev <= 0 ? heroArticles.length - 1 : prev - 1));
  }, [heroArticles.length]);

  useEffect(() => {
    if (heroHovered || heroArticles.length <= 1) return;
    const timer = setInterval(heroNext, 5000);
    return () => clearInterval(timer);
  }, [heroHovered, heroNext, heroArticles.length]);

  const currentHero = heroArticles[heroIndex];

  return (
    <div className="space-y-16">
      {/* HERO CAROUSEL */}
      <section
        className="relative animate-fade-up"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="inline-block animate-slide-down text-xs font-semibold uppercase tracking-[0.3em] text-gold">Featured</span>
            <h1 className="mt-2 font-display text-4xl md:text-6xl text-gradient-gold animate-fade-up" style={{ animationDelay: "0.1s" }}>The story of the moment.</h1>
          </div>
        </div>

        {currentHero ? (
          <div className="relative group/hero">
            {/* Navigation arrows */}
            {heroArticles.length > 1 && (
              <>
                <button
                  onClick={heroPrev}
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-glass/80 text-silver backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-4px] hover:shadow-gold/40 opacity-100 md:opacity-0 md:group-hover/hero:opacity-100"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={heroNext}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-glass/80 text-silver backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-4px] hover:shadow-gold/40 opacity-100 md:opacity-0 md:group-hover/hero:opacity-100"
                  aria-label="Next story"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Slide card */}
            <Link
              key={currentHero.id}
              to="/article/$slug"
              params={{ slug: currentHero.slug }}
              className="group glass-card hover-glow relative grid overflow-hidden rounded-3xl md:grid-cols-2 transition-all duration-500 hover:-translate-y-1 animate-fade-in"
            >
              <div className="relative aspect-[16/10] md:aspect-auto bg-muted overflow-hidden">
                {currentHero.featured_image_url ? (
                  <img
                    src={currentHero.featured_image_url}
                    alt={currentHero.title}
                    fetchPriority="high"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-navy via-secondary to-primary/40" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
                {currentHero.category && (
                  <span className="w-fit rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold">{currentHero.category.name}</span>
                )}
                <h2 className="font-display text-3xl md:text-5xl text-foreground transition group-hover:text-gold">{currentHero.title}</h2>
                {currentHero.excerpt && <p className="text-base text-muted-foreground line-clamp-3">{currentHero.excerpt}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(currentHero.publish_at ?? currentHero.created_at)}</span>
                  <span>·</span>
                  <span>{currentHero.read_time} min read</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">Read story <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>

            {/* Dot indicators */}
            {heroArticles.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                {heroArticles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === heroIndex
                        ? "w-8 bg-gold shadow-[0_0_8px_0] shadow-gold/50"
                        : "w-1.5 bg-silver/30 hover:bg-silver/60"
                    }`}
                    aria-label={`Go to story ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground">
            No articles yet — sign in to <Link to="/admin" className="text-gold underline">admin</Link> to publish your first story.
          </div>
        )}
      </section>

      <AdSlot size="970x90 — Header Banner" />

      {/* MAIN GRID: sections + trending sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-14">
          {CATEGORY_SECTIONS.map((sec) => {
            const items = bySection[sec.slug] ?? [];
            if (!items.length) return null;
            return (
              <section key={sec.slug}>
                <div className="mb-5 flex items-end justify-between">
                  <h2 className="font-display text-2xl md:text-3xl text-foreground">{sec.title}</h2>
                  <Link to="/category/$slug" params={{ slug: sec.slug }} className="text-xs font-semibold uppercase tracking-widest text-gold hover:underline">
                    View all
                  </Link>
                </div>
                <CardCarousel articles={items.slice(0, 9)} visibleCount={3} autoSlideMs={4500} />
              </section>
            );
          })}
          <AdSlot size="728x250 — Mid Page" className="!min-h-[250px]" />
        </div>

        <aside className="space-y-8">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2 text-gold">
              <TrendingUp className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-widest">Trending</h3>
            </div>
            <ol className="space-y-4">
              {trending.length === 0 && <li className="text-sm text-muted-foreground">Nothing trending yet.</li>}
              {trending.map((a, i) => (
                <li key={a.id}>
                  <Link to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3">
                    <span className="font-display text-2xl text-gold/60 group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-sm font-medium leading-snug text-foreground group-hover:text-gold">{a.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatDate(a.publish_at ?? a.created_at)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <AdSlot size="300x600 — Sidebar" className="!min-h-[600px]" />
        </aside>
      </div>

      <NewsletterSignup />
    </div>
  );
}
