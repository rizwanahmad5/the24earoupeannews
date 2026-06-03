import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Shield, PenLine, Eye, EyeOff, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

interface UserRow {
  user_id: string;
  role: "admin" | "author" | "user";
  email: string;
  display_name: string | null;
  created_at: string;
  post_limit: number | null;
  article_count?: number;
}

function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"author" | "admin">("author");
  const [postLimit, setPostLimit] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = async () => {
    // Fetch all user_roles with profiles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at, post_limit")
      .order("created_at", { ascending: false });

    if (!roles) return;

    // Fetch profiles for these users
    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.display_name])
    );

    // Count articles per author
    const { data: articleCounts } = await supabase
      .from("articles")
      .select("author_id");

    const countMap = new Map<string, number>();
    (articleCounts ?? []).forEach((a) => {
      if (a.author_id) {
        countMap.set(a.author_id, (countMap.get(a.author_id) ?? 0) + 1);
      }
    });

    const merged: UserRow[] = roles.map((r) => ({
      user_id: r.user_id,
      role: r.role as UserRow["role"],
      email: "",
      display_name: profileMap.get(r.user_id) ?? null,
      created_at: r.created_at,
      post_limit: r.post_limit ?? null,
      article_count: countMap.get(r.user_id) ?? 0,
    }));

    setUsers(merged);
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      // Sign up the new user via Supabase auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { display_name: displayName.trim() || email.split("@")[0] },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setCreating(false);
        return;
      }

      if (!signUpData.user) {
        toast.error("Failed to create user");
        setCreating(false);
        return;
      }

      const newUserId = signUpData.user.id;

      // Assign role with optional post limit
      const rolePayload: { user_id: string; role: string; post_limit?: number } = {
        user_id: newUserId,
        role: newRole,
      };
      if (postLimit.trim() && newRole === "author") {
        const limit = parseInt(postLimit.trim(), 10);
        if (!isNaN(limit) && limit > 0) {
          rolePayload.post_limit = limit;
        }
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert(rolePayload);

      if (roleError) {
        toast.error("User created but role assignment failed: " + roleError.message);
        setCreating(false);
        return;
      }

      // Update profile display name
      await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || email.split("@")[0] })
        .eq("id", newUserId);

      toast.success(`${newRole === "admin" ? "Admin" : "Author"} account created for ${email}`);
      setEmail("");
      setPassword("");
      setDisplayName("");
      setPostLimit("");
      setShowForm(false);
      loadUsers();
    } catch {
      toast.error("An unexpected error occurred");
    }
    setCreating(false);
  };

  const changeRole = async (userId: string, currentRole: string) => {
    const next = currentRole === "admin" ? "author" : "admin";
    const { error } = await supabase
      .from("user_roles")
      .update({ role: next })
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Role changed to ${next}`);
    loadUsers();
  };

  const updatePostLimit = async (userId: string, value: string) => {
    const limit = value.trim() === "" ? null : parseInt(value.trim(), 10);
    if (value.trim() !== "" && (isNaN(limit!) || limit! < 0)) {
      toast.error("Invalid post limit");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .update({ post_limit: limit })
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(limit === null ? "Post limit removed (unlimited)" : `Post limit set to ${limit}`);
    loadUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Remove this user's role? They will lose access to the admin panel.")) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User role removed");
    loadUsers();
  };

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Access denied — admin only.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-gradient-gold">Users & Authors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New user
        </button>
      </div>

      {/* Create user form */}
      {showForm && (
        <form
          onSubmit={createUser}
          className="glass-card mt-6 rounded-2xl p-6 animate-fade-up"
        >
          <h2 className="font-display text-xl text-foreground mb-4">Create new account</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="author@example.com"
                className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 pr-10 text-sm focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                Role *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "author" | "admin")}
                className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value="author">Author (post articles only)</option>
                <option value="admin">Admin (full access)</option>
              </select>
            </div>
            {newRole === "author" && (
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                  Post Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={postLimit}
                  onChange={(e) => setPostLimit(e.target.value)}
                  placeholder="Leave empty = unlimited"
                  className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2 text-sm focus:border-gold focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Maximum number of articles this author can create.</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-glass-border px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="glass-card mt-6 overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-glass text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Post Limit</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users yet. Create one above.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <UserRow key={u.user_id} user={u} onChangeRole={changeRole} onDelete={deleteUser} onUpdatePostLimit={updatePostLimit} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Inline-editable user row */
function UserRow({
  user: u,
  onChangeRole,
  onDelete,
  onUpdatePostLimit,
}: {
  user: UserRow;
  onChangeRole: (id: string, role: string) => void;
  onDelete: (id: string) => void;
  onUpdatePostLimit: (id: string, value: string) => void;
}) {
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitValue, setLimitValue] = useState(u.post_limit != null ? String(u.post_limit) : "");

  return (
    <tr className="border-t border-glass-border">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">
          {u.display_name || "—"}
        </div>
        <div className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}…</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
            u.role === "admin"
              ? "bg-gold/15 text-gold"
              : "bg-primary/10 text-primary"
          }`}
        >
          {u.role === "admin" ? (
            <Shield className="h-3 w-3" />
          ) : (
            <PenLine className="h-3 w-3" />
          )}
          {u.role}
        </span>
      </td>
      <td className="px-4 py-3">
        {u.role === "author" ? (
          editingLimit ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                placeholder="∞"
                className="w-16 rounded border border-glass-border bg-background/40 px-2 py-1 text-xs focus:border-gold focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onUpdatePostLimit(u.user_id, limitValue); setEditingLimit(false); }
                  if (e.key === "Escape") setEditingLimit(false);
                }}
              />
              <button
                onClick={() => { onUpdatePostLimit(u.user_id, limitValue); setEditingLimit(false); }}
                className="text-green-400 hover:text-green-300"
                title="Save"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setLimitValue(u.post_limit != null ? String(u.post_limit) : ""); setEditingLimit(true); }}
              className="text-xs text-muted-foreground hover:text-gold transition"
              title="Click to edit post limit"
            >
              {u.post_limit != null ? (
                <span>
                  <span className={`font-semibold ${(u.article_count ?? 0) >= u.post_limit ? "text-red-400" : "text-foreground"}`}>
                    {u.article_count ?? 0}
                  </span>
                  <span className="text-muted-foreground"> / {u.post_limit}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">∞ unlimited</span>
              )}
            </button>
          )
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {new Date(u.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onChangeRole(u.user_id, u.role)}
          className="mr-2 inline-flex h-8 items-center gap-1 rounded-md border border-glass-border px-2 text-xs hover:text-gold"
          title={`Switch to ${u.role === "admin" ? "author" : "admin"}`}
        >
          {u.role === "admin" ? "→ Author" : "→ Admin"}
        </button>
        <button
          onClick={() => onDelete(u.user_id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-glass-border hover:text-destructive"
          title="Remove role"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
