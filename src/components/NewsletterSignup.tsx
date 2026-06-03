import { useState } from "react";
import { Mail } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.string().trim().email("Please enter a valid email").max(255);

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email: parsed.data });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed.");
      else toast.error("Could not subscribe. Try again.");
      return;
    }
    setEmail("");
    toast.success("Welcome aboard — check your inbox soon.");
  };

  return (
    <section className="glass-card relative overflow-hidden rounded-3xl p-8 md:p-12">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
          <Mail className="h-3 w-3" /> Newsletter
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-gradient-gold">
          The signal beneath the noise
        </h2>
        <p className="mt-3 text-muted-foreground">
          A curated digest of our finest reporting, delivered each weekday morning.
        </p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="flex-1 rounded-full border border-glass-border bg-background/40 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-gold/90 disabled:opacity-60"
          >
            {loading ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
