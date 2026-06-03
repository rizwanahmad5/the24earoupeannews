import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

interface Cat { id: string; name: string; slug: string }

function Categories() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: slugify(name) });
    if (error) { toast.error(error.message); return; }
    setName(""); toast.success("Added"); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-gradient-gold">Categories</h1>
      <form onSubmit={add} className="glass-card mt-6 flex gap-2 rounded-2xl p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="flex-1 rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
        <button className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </form>
      <div className="glass-card mt-4 divide-y divide-glass-border rounded-2xl">
        {rows.length === 0 && <div className="p-4 text-sm text-muted-foreground">No categories.</div>}
        {rows.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug}</div>
            </div>
            <button onClick={() => del(c.id)} className="text-silver hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
