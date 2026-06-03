import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Admin Login — The 24 European News" }, { name: "robots", content: "noindex" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back");
    navigate({ to: "/admin" });
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="glass-card rounded-3xl p-8">
        <h1 className="font-display text-3xl text-gradient-gold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Admin & author access only.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 focus:border-gold focus:outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Password" className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 focus:border-gold focus:outline-none" />
          <button type="submit" disabled={loading} className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Don't have an account? Contact your administrator.
        </p>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-gold">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
