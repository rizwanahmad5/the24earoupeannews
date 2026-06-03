import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, FileText, FolderTree, Radio, Mail, LogOut, Users, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — The 24 European News" }, { name: "robots", content: "noindex" }] }),
});

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/ticker", label: "Ticker", icon: Radio },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/ads", label: "Ads", icon: Megaphone },
];

const AUTHOR_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/articles", label: "My Articles", icon: FileText },
];

function AdminLayout() {
  const { user, role, isAdmin, isAuthor, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin && !isAuthor) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="font-display text-2xl">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin or author privileges. Contact an administrator for access.
          </p>
          <button onClick={signOut} className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  const nav = isAdmin ? ADMIN_NAV : AUTHOR_NAV;

  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <aside className="glass-card h-fit rounded-2xl p-4">
        <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-gold">
          {isAdmin ? "Admin" : "Author"}
        </div>
        <div className="mb-4 px-3 text-[11px] text-muted-foreground truncate">
          {user.email}
        </div>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-silver transition hover:bg-glass hover:text-gold"
              activeProps={{ className: "bg-gold/10 text-gold" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-silver hover:bg-glass hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>
      </aside>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}
