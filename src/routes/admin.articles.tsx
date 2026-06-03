import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/articles")({ component: ArticlesList });

interface Row {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string;
  author_id: string | null;
  author_name?: string;
}

function ArticlesList() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    if (!user) return;

    let query = supabase
      .from("articles")
      .select("id, title, slug, status, updated_at, author_id")
      .order("updated_at", { ascending: false });

    // Authors only see their own articles (RLS also enforces this)
    if (!isAdmin) {
      query = query.eq("author_id", user.id);
    }

    const { data } = await query;
    const articles = (data ?? []) as Row[];

    // For admins, fetch author display names
    if (isAdmin && articles.length > 0) {
      const authorIds = [...new Set(articles.map((a) => a.author_id).filter(Boolean))] as string[];
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", authorIds);
        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.id, p.display_name || "Unknown"])
        );
        articles.forEach((a) => {
          if (a.author_id) a.author_name = profileMap.get(a.author_id) || "Unknown";
        });
      }
    }

    setRows(articles);
  };

  useEffect(() => {
    load();
  }, [user, isAdmin]);

  const del = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const approveArticle = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update({ status: "published", publish_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Article approved & published");
    load();
  };

  const rejectArticle = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update({ status: "draft" })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Article sent back to draft");
    load();
  };

  const pendingCount = rows.filter((r) => r.status === "pending_review").length;

  const statusColor = (s: string) => {
    switch (s) {
      case "published": return "text-green-400";
      case "scheduled": return "text-blue-400";
      case "pending_review": return "text-amber-400";
      default: return "text-gold";
    }
  };

  const statusLabel = (s: string) => s === "pending_review" ? "Pending Review" : s;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-gradient-gold">
            {isAdmin ? "All Articles" : "My Articles"}
          </h1>
          {isAdmin && pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 animate-pulse">
              {pendingCount} pending
            </span>
          )}
        </div>
        <Link to="/admin/articles/new" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New article
        </Link>
      </div>
      <div className="glass-card mt-6 overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-glass text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              {isAdmin && <th className="px-4 py-3">Author</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">No articles yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className={`border-t border-glass-border ${r.status === "pending_review" ? "bg-amber-500/5" : ""}`}>
                <td className="px-4 py-3 text-foreground">{r.title}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {r.author_name || "—"}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold uppercase tracking-widest ${statusColor(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.updated_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {/* Approve / Reject for admins on pending_review articles */}
                    {isAdmin && r.status === "pending_review" && (
                      <>
                        <button
                          onClick={() => approveArticle(r.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 text-xs text-green-400 hover:bg-green-500/20 transition"
                          title="Approve & publish"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => rejectArticle(r.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 text-xs text-red-400 hover:bg-red-500/20 transition"
                          title="Send back to draft"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}
                    <Link to="/admin/articles/$id/edit" params={{ id: r.id }} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-glass-border hover:text-gold">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => del(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-glass-border hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
