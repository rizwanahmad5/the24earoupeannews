import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/format";

export interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  publish_at: string | null;
  created_at: string;
  read_time: number;
  category?: { name: string; slug: string } | null;
}

export function ArticleCard({ article, size = "md" }: { article: ArticleCardData; size?: "sm" | "md" | "lg" }) {
  const date = article.publish_at ?? article.created_at;
  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-500 hover-lift"
    >
      <div className={`relative overflow-hidden ${size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]"} bg-muted`}>
        {article.featured_image_url ? (
          <img
            src={article.featured_image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy via-secondary to-muted" />
        )}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-navy/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold backdrop-blur">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className={`font-display leading-tight text-foreground transition group-hover:text-gold ${size === "lg" ? "text-2xl" : "text-lg"}`}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(date)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.read_time} min
          </span>
        </div>
      </div>
    </Link>
  );
}
