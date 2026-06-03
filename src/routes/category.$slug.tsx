import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";

import { DUMMY_ARTICLES, CATEGORY_SECTIONS } from "@/lib/dummyData";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace("-", " ")} — The 24 European News` },
      { name: "description", content: `Latest ${params.slug} stories from The 24 European News.` },
    ],
    links: [{ rel: "canonical", href: `/category/${params.slug}` }],
  }),
});

function CategoryPage() {
  const { slug } = useParams({ from: "/category/$slug" });
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [categoryName, setCategoryName] = useState(slug);

  useEffect(() => {
    (async () => {
      // 1. Try to fetch from database
      const { data: cat } = await supabase.from("categories").select("id, name").eq("slug", slug).maybeSingle();
      if (cat) {
        setCategoryName(cat.name);
        const { data } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt, featured_image_url, publish_at, created_at, read_time, category:categories(name, slug)")
          .eq("status", "published")
          .eq("category_id", cat.id)
          .order("publish_at", { ascending: false, nullsFirst: false });
        
        if (data && data.length > 0) {
          setArticles((data ?? []) as unknown as ArticleCardData[]);
          return;
        }
      }

      // 2. Fall back to dummy articles if database is empty or category not in DB yet
      const dummyCat = CATEGORY_SECTIONS.find(c => c.slug === slug);
      if (dummyCat) {
        setCategoryName(dummyCat.title);
      } else {
        setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " "));
      }

      const filteredDummy = DUMMY_ARTICLES.filter(a => a.category?.slug === slug);
      setArticles(filteredDummy);
    })();
  }, [slug]);

  return (
    <div>
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Section</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl text-gradient-gold">{categoryName}</h1>
      </div>
      {articles.length === 0 ? (
        <p className="text-muted-foreground">No articles in this section yet. <Link to="/" className="text-gold underline">Back home</Link></p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
