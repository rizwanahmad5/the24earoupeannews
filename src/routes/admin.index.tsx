import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, FolderTree, Eye, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ articles: 0, categories: 0, views: 0, subscribers: 0, pending: 0 });
  const [recent, setRecent] = useState<{ id: string; title: string; status: string; updated_at: string }[]>([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    (async () => {
      const [a, c, s, v, r, p] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("views"),
        supabase.from("articles").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      ]);
      const totalViews = (v.data ?? []).reduce((sum, row) => sum + (row.views ?? 0), 0);
      setStats({ articles: a.count ?? 0, categories: c.count ?? 0, subscribers: s.count ?? 0, views: totalViews, pending: p.count ?? 0 });
      setRecent(r.data ?? []);
    })();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      // 1. Ensure categories exist
      const categoriesToSeed = [
        { name: "Trending News", slug: "news" },
        { name: "International News", slug: "international-news" },
        { name: "Tech & AI", slug: "tech" },
        { name: "Business", slug: "business" },
        { name: "Finance", slug: "finance" },
        { name: "Health", slug: "health" },
        { name: "Politics", slug: "politics" },
        { name: "Entertainment", slug: "entertainment" },
        { name: "Lifestyle & Fashion", slug: "lifestyle" },
        { name: "Pet News", slug: "pet-news" },
      ];

      const categoryMap: Record<string, string> = {};

      for (const cat of categoriesToSeed) {
        // Check if exists
        const { data: existing } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", cat.slug)
          .maybeSingle();

        if (existing) {
          categoryMap[cat.slug] = existing.id;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("categories")
            .insert({ name: cat.name, slug: cat.slug })
            .select("id")
            .single();

          if (insertError) throw insertError;
          if (inserted) categoryMap[cat.slug] = inserted.id;
        }
      }

      // 2. Fetch dummy articles
      const { DUMMY_ARTICLES } = await import("@/lib/dummyData");

      // Get current user to set as author
      const { data: { user } } = await supabase.auth.getUser();
      const authorId = user?.id || null;

      // 3. Insert articles
      let seededCount = 0;
      for (const art of DUMMY_ARTICLES) {
        // Check if article with this slug already exists
        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("slug", art.slug)
          .maybeSingle();

        if (existing) continue; // Skip already seeded

        const categoryId = art.category?.slug ? categoryMap[art.category.slug] : null;

        const contentHtml = `
          <p class="lead"><strong>This premium report from The 24 European News covers the latest updates on "${art.title}".</strong></p>
          <p>${art.excerpt || "Our team of dedicated reporters and industry specialists bring you the deep background on this story."}</p>
          <h2>Key Highlights & Impact</h2>
          <p>As this story develops, key analysts suggest that the primary drivers are rooted in shifting modern trends. Experts are closely monitoring these dynamics to predict the long-term impact on global networks and local markets.</p>
          <blockquote>
            "This development represents a major turning point in the field, challenging previous assumptions and opening up new possibilities."
            <br>— The 24 European News Editorial Board
          </blockquote>
          <p>We will continue to provide updates as new information emerges from our correspondents. Stay tuned for further developments.</p>
        `;

        const { error } = await supabase.from("articles").insert({
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          featured_image_url: art.featured_image_url,
          read_time: art.read_time,
          status: "published",
          category_id: categoryId,
          content_html: contentHtml,
          views: art.views || 0,
          author_id: authorId,
          publish_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error seeding article:", error);
        } else {
          seededCount++;
        }
      }

      alert(`Seeding complete! Seeded ${seededCount} articles.`);
      // Refresh page
      window.location.reload();
    } catch (err: any) {
      alert("Error seeding database: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { label: "Articles", value: stats.articles, icon: FileText },
    { label: "Categories", value: stats.categories, icon: FolderTree },
    { label: "Total Views", value: stats.views, icon: Eye },
    { label: "Subscribers", value: stats.subscribers, icon: Users },
    ...(isAdmin ? [{ label: "Pending Review", value: stats.pending, icon: Clock }] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-gradient-gold">Dashboard</h1>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="rounded-full border border-gold bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold/20 disabled:opacity-50 transition"
        >
          {seeding ? "Seeding..." : "Seed Dummy Articles"}
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className={`glass-card rounded-2xl p-5 ${c.label === "Pending Review" && c.value > 0 ? "ring-1 ring-amber-500/40" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.label === "Pending Review" && c.value > 0 ? "text-amber-400" : "text-gold"}`} />
            </div>
            <div className={`mt-3 font-display text-3xl ${c.label === "Pending Review" && c.value > 0 ? "text-amber-400" : "text-foreground"}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 glass-card rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Recent activity</h2>
          <Link to="/admin/articles" className="text-xs text-gold hover:underline">View all</Link>
        </div>
        <ul className="divide-y divide-glass-border">
          {recent.length === 0 && <li className="py-3 text-sm text-muted-foreground">No articles yet.</li>}
          {recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-foreground">{a.title}</span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${
                a.status === "published" ? "text-green-400"
                : a.status === "pending_review" ? "text-amber-400"
                : a.status === "scheduled" ? "text-blue-400"
                : "text-gold"
              }`}>
                {a.status === "pending_review" ? "Pending Review" : a.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
