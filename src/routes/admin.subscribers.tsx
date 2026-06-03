import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/subscribers")({ component: Subs });

function Subs() {
  const [rows, setRows] = useState<{ id: string; email: string; created_at: string }[]>([]);
  useEffect(() => {
    supabase.from("subscribers").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-gradient-gold">Subscribers ({rows.length})</h1>
      <div className="glass-card mt-6 divide-y divide-glass-border rounded-2xl">
        {rows.length === 0 && <div className="p-4 text-sm text-muted-foreground">No subscribers yet.</div>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-foreground">{r.email}</span>
            <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
