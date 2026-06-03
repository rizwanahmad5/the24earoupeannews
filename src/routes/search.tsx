import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/ArticleCard";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — The 24 European News" }, { name: "description", content: "Search across The 24 European News." }] }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [results, setResults] = useState<ArticleCardData[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, publish_at, created_at, read_time, category:categories(name, slug)")
        .eq("status", "published");
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
      if (cat) query = query.eq("category_id", cat);
      const { data } = await query.order("publish_at", { ascending: false, nullsFirst: false }).limit(30);
      setResults((data ?? []) as unknown as ArticleCardData[]);
    }, 250);
    return () => clearTimeout(t);
  }, [q, cat]);

  return (
    <div>
      <h1 className="font-display text-4xl text-gradient-gold">Search</h1>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-full border border-glass-border bg-glass py-3 pl-11 pr-4 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-full border border-glass-border bg-glass px-4 py-3 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.length === 0 && <p className="text-muted-foreground">No results.</p>}
        {results.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
