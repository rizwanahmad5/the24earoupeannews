import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DUMMY_ARTICLES } from "@/lib/dummyData";

interface TickerArticle {
  id: string;
  title: string;
  slug: string;
}

export function BreakingTicker() {
  const [articles, setArticles] = useState<TickerArticle[]>([]);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, slug")
      .eq("status", "published")
      .order("publish_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length) {
          setArticles(data as TickerArticle[]);
        } else {
          // Fallback to dummy articles if database is empty
          setArticles(
            DUMMY_ARTICLES.slice(0, 10).map((a) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
            }))
          );
        }
      })
      .catch(() => {
        // Fallback on query failure
        setArticles(
          DUMMY_ARTICLES.slice(0, 10).map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
          }))
        );
      });
  }, []);

  if (!articles.length) return null;

  // Duplicate items to ensure a seamless looping marquee effect
  const loop = [...articles, ...articles, ...articles];

  return (
    <div className="ticker-bar relative z-10 border-b border-glass-border bg-navy/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2">
        <div className="ticker-badge flex shrink-0 items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
          <Radio className="h-3 w-3 animate-pulse" />
          Breaking
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-text flex animate-ticker gap-12 whitespace-nowrap text-sm text-silver hover:[animation-play-state:paused] cursor-pointer">
            {loop.map((art, i) => (
              <Link
                key={`${art.id}-${i}`}
                to="/article/$slug"
                params={{ slug: art.slug }}
                className="inline-flex items-center gap-3 transition-colors duration-200 hover:text-gold"
              >
                <span className="text-gold">◆</span>
                <span>{art.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
