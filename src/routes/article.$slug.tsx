import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Clock, List, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";
import { ShareButtons } from "@/components/ShareButtons";
import { CommentsSection } from "@/components/CommentsSection";
import { AdSlot } from "@/components/AdSlot";
import { formatDate } from "@/lib/format";
import { DUMMY_ARTICLES } from "@/lib/dummyData";

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
  isDummy?: boolean;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOC â€” Heading extraction, ID injection, active tracking
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

interface TocItem {
  id: string;
  text: string;
  level: number; // 2, 3, or 4
}

/** Generate a URL-safe slug from heading text */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Parse headings from HTML and return TOC items + HTML with injected IDs */
function parseHeadingsAndInjectIds(html: string): { items: TocItem[]; processedHtml: string } {
  const items: TocItem[] = [];
  const slugCounts = new Map<string, number>();

  const processedHtml = html.replace(
    /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, innerHtml: string) => {
      const level = parseInt(tag.charAt(1), 10);
      // Strip HTML tags from inner content for the TOC text
      const text = innerHtml.replace(/<[^>]*>/g, "").trim();
      if (!text) return _match;

      let baseSlug = slugifyHeading(text);
      if (!baseSlug) baseSlug = `section-${items.length + 1}`;

      // Handle duplicate headings
      const count = slugCounts.get(baseSlug) ?? 0;
      slugCounts.set(baseSlug, count + 1);
      const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;

      items.push({ id, text, level });

      // Check if there's already an id attribute
      if (/\bid\s*=/i.test(attrs)) {
        return `<${tag}${attrs}>${innerHtml}</${tag}>`;
      }
      return `<${tag} id="${id}"${attrs}>${innerHtml}</${tag}>`;
    }
  );

  return { items, processedHtml };
}

/** Table of Contents component with active section tracking */
function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    // Small delay to let the DOM render the heading IDs
    const timer = setTimeout(() => {
      const headingEls = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      if (headingEls.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Find the first heading that is intersecting from the top
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        {
          rootMargin: "-80px 0px -60% 0px",
          threshold: [0, 0.5, 1],
        }
      );

      headingEls.forEach((el) => observerRef.current!.observe(el));
    }, 200);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [items]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Update URL hash without page jump
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }, []);

  if (items.length === 0) return null;

  const minLevel = Math.min(...items.map((i) => i.level));

  return (
    <nav
      className="mb-10 rounded-2xl border border-glass-border bg-card/80 backdrop-blur-md overflow-hidden transition-all duration-500 animate-fade-in"
      aria-label="Table of Contents"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-glass/30"
      >
        <div className="flex items-center gap-2.5">
          <List className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Table of Contents
          </span>
          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
            {items.length}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Items */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-glass-border px-6 py-4">
          <ol className="space-y-1" role="list">
            {items.map((item, i) => {
              const indent = item.level - minLevel;
              const isActive = activeId === item.id;

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={`group relative flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-gold/8 text-gold font-medium"
                        : "text-muted-foreground hover:bg-glass/40 hover:text-foreground"
                    }`}
                    style={{ paddingLeft: `${12 + indent * 20}px` }}
                    aria-current={isActive ? "location" : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all duration-300" />
                    )}

                    {/* Bullet */}
                    <span
                      className={`mt-[7px] flex-shrink-0 rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-1.5 w-1.5 bg-gold shadow-[0_0_6px_rgba(212,175,55,0.5)]"
                          : "h-1 w-1 bg-muted-foreground/40 group-hover:bg-foreground/50"
                      }`}
                    />

                    {/* Text */}
                    <span className="leading-snug">{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Dummy content builder
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * Build a rich article body from a dummy article's excerpt.
 * This provides a full reading experience even for fallback/demo content.
 */
function buildDummyContent(title: string, excerpt: string | null): string {
  const lead = excerpt || "Our team of dedicated reporters brings you the latest on this developing story.";
  return `
    <p class="lead"><strong>${lead}</strong></p>
    <p>This premium report from The 24 European News covers the latest updates on "${title}". Our correspondents across Europe have been tracking this story as it unfolds, gathering insights from key stakeholders and industry experts.</p>
    <h2>Key Highlights</h2>
    <p>As this story develops, analysts suggest the primary drivers are rooted in shifting modern trends. Experts are closely monitoring these dynamics to predict long-term impacts on global networks, local markets, and emerging industries.</p>
    <blockquote>
      "This development represents a major turning point, challenging previous assumptions and opening up new possibilities for the future."
      <br>â€” The 24 European News Editorial Board
    </blockquote>
    <h2>What This Means</h2>
    <p>Industry watchers have noted that the implications extend far beyond the immediate context. The ripple effects are expected to influence policy decisions, market strategies, and public discourse in the coming months.</p>
    <p>Leading analysts from institutions across Europe have weighed in, offering varied perspectives on both the short-term disruptions and the long-term opportunities that may emerge from these developments.</p>
    <h2>Looking Ahead</h2>
    <p>We will continue to provide updates as new information emerges from our correspondents. Stay tuned for further developments, exclusive interviews, and in-depth analysis.</p>
    <p><em>This article is part of The 24 European News's commitment to delivering premium, in-depth reporting on the stories shaping tomorrow.</em></p>
  `;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Article Page
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ArticlePage() {
  const { slug } = useParams({ from: "/article/$slug" });
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [related, setRelated] = useState<ArticleCardData[]>([]);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    // Reset state when slug changes
    setArticle(null);
    setRelated([]);
    setNotFoundFlag(false);

    (async () => {
      // 1. Try fetching from Supabase
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, content_html, featured_image_url, publish_at, created_at, read_time, tags, category_id, category:categories(name, slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        console.error("[ArticlePage] Supabase query error:", error);
      }

      if (data) {
        // Real article found in database
        setArticle(data as unknown as FullArticle);

        // Increment views (fire and forget â€” may fail for anonymous users, that's OK)
        supabase
          .from("articles")
          .update({ views: ((data as { views?: number }).views ?? 0) + 1 })
          .eq("id", data.id)
          .then(({ error: viewErr }) => {
            if (viewErr) console.warn("[ArticlePage] View increment skipped (RLS):", viewErr.message);
          });

        // Fetch related articles
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
        return;
      }

      // 2. Article not in database â€” check if it's a dummy/demo article
      const dummyMatch = DUMMY_ARTICLES.find((a) => a.slug === slug);
      if (dummyMatch) {
        const dummyArticle: FullArticle = {
          id: dummyMatch.id,
          title: dummyMatch.title,
          slug: dummyMatch.slug,
          excerpt: dummyMatch.excerpt,
          content_html: buildDummyContent(dummyMatch.title, dummyMatch.excerpt),
          featured_image_url: dummyMatch.featured_image_url,
          publish_at: dummyMatch.publish_at,
          created_at: dummyMatch.created_at,
          read_time: dummyMatch.read_time,
          tags: [],
          category_id: null,
          category: dummyMatch.category ?? null,
          author: { display_name: "The 24 European News Staff" },
          isDummy: true,
        };
        setArticle(dummyArticle);

        // Fetch related dummy articles from the same category
        if (dummyMatch.category?.slug) {
          const relatedDummies = DUMMY_ARTICLES
            .filter((a) => a.category?.slug === dummyMatch.category?.slug && a.id !== dummyMatch.id)
            .slice(0, 3) as unknown as ArticleCardData[];
          setRelated(relatedDummies);
        }
        return;
      }

      // 3. Truly not found
      console.warn(`[ArticlePage] No article found for slug: "${slug}"`);
      setNotFoundFlag(true);
    })();
  }, [slug]);

  // Parse headings and inject IDs into the HTML content
  const { tocItems, renderedHtml } = useMemo(() => {
    if (!article?.content_html) return { tocItems: [] as TocItem[], renderedHtml: "" };
    const { items, processedHtml } = parseHeadingsAndInjectIds(article.content_html);
    return { tocItems: items, renderedHtml: processedHtml };
  }, [article?.content_html]);

  if (notFoundFlag) throw notFound();
  if (!article) return <div className="py-20 text-center text-muted-foreground">Loadingâ€¦</div>;

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
          <span>Â·</span>
          <span>{formatDate(article.publish_at ?? article.created_at)}</span>
          <span>Â·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.read_time} min read</span>
        </div>
      </div>

      {article.featured_image_url && (
        <img src={article.featured_image_url} alt={article.title} fetchPriority="high" className="mb-8 w-full rounded-2xl object-cover" />
      )}

      {/* Dynamic Table of Contents */}
      {tocItems.length > 0 && <TableOfContents items={tocItems} />}

      <AdSlot size="728x90 â€” Below Title" className="mb-8" />

      <div className="prose-article" dangerouslySetInnerHTML={{ __html: renderedHtml }} />

      <AdSlot size="728x90 â€” Mid Article" className="my-10" />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags?.map((t) => (
            <span key={t} className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-silver">#{t}</span>
          ))}
        </div>
        <ShareButtons url={url} title={article.title} />
      </div>

      <AdSlot size="728x90 â€” End of Article" className="mt-10" />

      {!article.isDummy && <CommentsSection articleId={article.id} />}

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
