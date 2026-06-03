import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const schema = z.object({
  author_name: z.string().trim().min(1, "Name required").max(80),
  body: z.string().trim().min(1, "Comment required").max(2000),
});

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, author_name, body, created_at")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });
    setComments(data ?? []);
  };

  useEffect(() => {
    load();
  }, [articleId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ author_name: name, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      ...parsed.data,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not post comment");
      return;
    }
    setBody("");
    toast.success("Comment posted");
    load();
  };

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-foreground">Comments ({comments.length})</h2>
      <form onSubmit={submit} className="glass-card mt-6 space-y-3 rounded-2xl p-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Your name"
          required
          className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder="Share your thoughts…"
          required
          rows={3}
          className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-gold/90 disabled:opacity-60"
        >
          {loading ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">Be the first to comment.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="glass-card rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-foreground">{c.author_name}</span>
              <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
