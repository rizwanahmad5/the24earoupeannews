import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RichTextEditor } from "./RichTextEditor";
import { slugify, readTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

interface Props { articleId?: string; onSaved: () => void }

export function ArticleEditor({ articleId, onSaved }: Props) {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featured, setFeatured] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled" | "pending_review">("draft");
  const [publishAt, setPublishAt] = useState("");
  const [content, setContent] = useState<unknown>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(!articleId);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (!articleId) return;
    supabase.from("articles").select("*").eq("id", articleId).maybeSingle().then(({ data }) => {
      if (!data) return;
      setTitle(data.title); setSlug(data.slug); setExcerpt(data.excerpt ?? "");
      setFeatured(data.featured_image_url ?? ""); setCategoryId(data.category_id ?? "");
      setTags((data.tags ?? []).join(", ")); setStatus(data.status);
      setPublishAt(data.publish_at ? data.publish_at.slice(0, 16) : "");
      setContent(data.content); setContentHtml(data.content_html ?? "");
      setLoaded(true);
    });
  }, [articleId]);

  const uploadImage = async (file: File) => {
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    setFeatured(data.publicUrl);
    toast.success("Image uploaded");
  };

  const save = async () => {
    if (!title.trim()) { toast.error("Title required"); return; }
    setLoading(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const authorId = currentUser?.id ?? null;

    // --- Post limit check for non-admin users ---
    if (!isAdmin && !articleId) {
      // Fetch author's post limit
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("post_limit")
        .eq("user_id", authorId!)
        .maybeSingle();

      if (roleData?.post_limit != null) {
        // Count existing articles by this author
        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("author_id", authorId!);

        if (count != null && count >= roleData.post_limit) {
          toast.error(`Post limit reached (${roleData.post_limit}). Contact admin to increase your limit.`);
          setLoading(false);
          return;
        }
      }
    }

    // For non-admin users: force pending_review when they try to publish
    let finalStatus = status;
    if (!isAdmin && (status === "published" || status === "pending_review")) {
      finalStatus = "pending_review";
    }

    const payload = {
      title: title.trim(),
      slug: (slug || slugify(title)).trim(),
      excerpt: excerpt.trim() || null,
      content: content as never,
      content_html: contentHtml,
      featured_image_url: featured || null,
      category_id: categoryId || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: finalStatus,
      publish_at: publishAt ? new Date(publishAt).toISOString() : (finalStatus === "published" ? new Date().toISOString() : null),
      read_time: readTime(contentHtml.replace(/<[^>]+>/g, " ")),
      author_id: authorId,
    };
    const { error } = articleId
      ? await supabase.from("articles").update(payload).eq("id", articleId)
      : await supabase.from("articles").insert(payload);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(finalStatus === "pending_review" ? "Submitted for review" : "Saved");
    onSaved();
  };

  if (!loaded) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-gradient-gold">{articleId ? "Edit article" : "New article"}</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-3 text-lg focus:border-gold focus:outline-none" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={`Slug (auto: ${slugify(title) || "..."})`} className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" rows={2} className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Featured image</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="mt-1 w-full text-sm" />
          {featured && <img src={featured} alt="" className="mt-2 h-32 w-full rounded-lg object-cover" />}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none">
            <option value="">— none —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="mt-3 block text-xs uppercase tracking-widest text-muted-foreground">Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
        </div>
      </div>

      <RichTextEditor initialContent={content} onChange={(json, html) => { setContent(json); setContentHtml(html); }} />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Status</label>
          {isAdmin ? (
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="mt-1 w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none">
              <option value="draft">Draft</option>
              <option value="published">Publish now</option>
              <option value="scheduled">Schedule</option>
            </select>
          ) : (
            <select value={status === "pending_review" ? "pending_review" : "draft"} onChange={(e) => setStatus(e.target.value as typeof status)} className="mt-1 w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none">
              <option value="draft">Draft</option>
              <option value="pending_review">Submit for review</option>
            </select>
          )}
          {!isAdmin && status === "pending_review" && (
            <p className="mt-1.5 text-xs text-amber-400">⚠ Your article will be reviewed by an admin before publishing.</p>
          )}
        </div>
        {isAdmin && status === "scheduled" && (
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Publish at</label>
            <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="mt-1 w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
          </div>
        )}
      </div>

      <button onClick={save} disabled={loading} className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {loading ? "Saving…" : !isAdmin && status === "pending_review" ? "Submit for review" : "Save article"}
      </button>
    </div>
  );
}
