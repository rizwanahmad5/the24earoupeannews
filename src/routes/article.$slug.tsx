import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";
import { ShareButtons } from "@/components/ShareButtons";
import { CommentsSection } from "@/components/CommentsSection";
import { AdSlot } from "@/components/AdSlot";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/article/$slug")({
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="font-display text-3xl">Article not found</h1>
      <Link to="/" className="mt-4 inline-block text-gold underline">Back home</Link>
    </div>
  ),
  errorComponent: () => <div className="text-center py-20 text-muted-foreground">Could not load article.</div>,
});

interface FullArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  featured_image_url: string | null;
  publish_at: string | null;
  created_at: string;
  read_time: number;
  tags: string[];
  category_id: string | null;
  category: { name: string; slug: string } | null;
  author?: { display_name: string | null } | null;
}

function ArticlePage() {
  const { slug } = useParams({ from: "/article/$slug" });
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [related, setRelated] = useState<ArticleCardData[]>([]);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, content_html, featured_image_url, publish_at, created_at, read_time, tags, category_id, category:categories(name, slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) { setNotFoundFlag(true); return; }
      setArticle(data as unknown as FullArticle);
      // increment views (fire and forget)
      void supabase.from("articles").update({ views: ((data as { views?: number }).views ?? 0) + 1 }).eq("id", data.id);
      // related
      if (data.category_id) {
        const { data: rel } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt, featured_image_url, publish_at, created_at, read_time, category:categories(name, slug)")
          .eq("status", "published")
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .limit(3);
        setRelated((rel ?? []) as unknown as ArticleCardData[]);
      }
    })();
  }, [slug]);

  if (notFoundFlag) throw notFound();
  if (!article) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;

  const url = typeof window !== "undefined" ? window.location.href : `/article/${article.slug}`;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6">
        {article.category && (
          <Link to="/category/$slug" params={{ slug: article.category.slug }} className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
            {article.category.name}
          </Link>
        )}
        <h1 className="mt-4 font-display text-4xl md:text-5xl text-foreground">{article.title}</h1>
        {article.excerpt && <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{article.author?.display_name ?? "The 24 European News Staff"}</span>
          <span>·</span>
          <span>{formatDate(article.publish_at ?? article.created_at)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.read_time} min read</span>
        </div>
      </div>

      {article.featured_image_url && (
        <img src={article.featured_image_url} alt={article.title} fetchPriority="high" className="mb-6 w-full rounded-2xl object-cover" />
      )}

      <AdSlot size="728x90 — Below Title" className="mb-8" />

      <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.content_html ?? "" }} />

      <AdSlot size="728x90 — Mid Article" className="my-10" />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags?.map((t) => (
            <span key={t} className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-silver">#{t}</span>
          ))}
        </div>
        <ShareButtons url={url} title={article.title} />
      </div>

      <AdSlot size="728x90 — End of Article" className="mt-10" />

      <CommentsSection articleId={article.id} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl">Related stories</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </article>
  );
}
