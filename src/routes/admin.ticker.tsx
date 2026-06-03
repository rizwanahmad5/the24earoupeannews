import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ticker")({ component: TickerAdmin });

interface Msg { id: string; message: string; active: boolean; sort_order: number }

function TickerAdmin() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("ticker_messages").select("*").order("sort_order");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase.from("ticker_messages").insert({ message: text.trim(), sort_order: rows.length });
    if (error) { toast.error(error.message); return; }
    setText(""); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("ticker_messages").update({ active: !active }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("ticker_messages").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-gradient-gold">Breaking news ticker</h1>
      <form onSubmit={add} className="glass-card mt-6 flex gap-2 rounded-2xl p-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New ticker message" className="flex-1 rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none" />
        <button className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </form>
      <div className="glass-card mt-4 divide-y divide-glass-border rounded-2xl">
        {rows.length === 0 && <div className="p-4 text-sm text-muted-foreground">No ticker messages.</div>}
        {rows.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex-1 text-sm text-foreground">{m.message}</div>
            <button onClick={() => toggle(m.id, m.active)} className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${m.active ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}>
              {m.active ? "Active" : "Hidden"}
            </button>
            <button onClick={() => del(m.id)} className="text-silver hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
