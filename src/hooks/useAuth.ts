import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "author" | null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole;
  isAdmin: boolean;
  isAuthor: boolean;
  loading: boolean;
}

async function fetchRole(userId: string): Promise<AppRole> {
  // Check admin first, then author
  const { data: adminData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (adminData) return "admin";

  const { data: authorData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "author")
    .maybeSingle();
  if (authorData) return "author";

  return null;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // defer the role lookup to avoid recursion in listener
          setTimeout(async () => {
            const r = await fetchRole(newSession.user.id);
            setRole(r);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id).then((r) => setRole(r));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: session?.user ?? null,
    session,
    role,
    isAdmin: role === "admin",
    isAuthor: role === "author",
    loading,
  };
}
