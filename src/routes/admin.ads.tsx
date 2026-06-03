import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Plus, Trash2, Megaphone, TrendingUp, BarChart3, 
  Upload, Play, Pause, Save, X, Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ads")({ component: AdsDashboard });

interface Ad {
  id: string;
  title: string;
  provider: "adsense" | "custom" | "sponsored" | "other";
  status: "active" | "inactive";
  ad_slot: "header_banner" | "mid_page" | "sidebar" | "footer_banner" | "mid_article" | "end_article";
  ad_size: string;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  target_url: string | null;
  html_content: string | null;
  adsense_client_id: string | null;
  adsense_slot_id: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

const SLOT_LABELS: Record<Ad["ad_slot"], string> = {
  header_banner: "Header Banner (970x90)",
  mid_page: "Mid Page Banner (728x250)",
  sidebar: "Sidebar Ad (300x600)",
  footer_banner: "Footer Banner (970x90)",
  mid_article: "Mid Article Banner (728x90)",
  end_article: "End of Article Banner (728x90)",
};

const DEFAULT_SIZES: Record<Ad["ad_slot"], string> = {
  header_banner: "970x90",
  mid_page: "728x250",
  sidebar: "300x600",
  footer_banner: "970x90",
  mid_article: "728x90",
  end_article: "728x90",
};

function AdsDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState<Ad["provider"]>("custom");
  const [status, setStatus] = useState<Ad["status"]>("active");
  const [adSlot, setAdSlot] = useState<Ad["ad_slot"]>("header_banner");
  const [adSize, setAdSize] = useState("970x90");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [adsenseClientId, setAdsenseClientId] = useState("");
  const [adsenseSlotId, setAdsenseSlotId] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data as Ad[]);
    } catch (err: any) {
      toast.error("Failed to load advertisements: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadAds();
  }, [isAdmin]);

  // Autofill size when slot changes
  useEffect(() => {
    setAdSize(DEFAULT_SIZES[adSlot]);
  }, [adSlot]);

  const openNewModal = () => {
    setEditingAd(null);
    setTitle("");
    setProvider("custom");
    setStatus("active");
    setAdSlot("header_banner");
    setAdSize("970x90");
    setStartDate("");
    setEndDate("");
    setImageUrl("");
    setTargetUrl("");
    setHtmlContent("");
    setAdsenseClientId("");
    setAdsenseSlotId("");
    setShowModal(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setProvider(ad.provider);
    setStatus(ad.status);
    setAdSlot(ad.ad_slot);
    setAdSize(ad.ad_size);
    setStartDate(ad.start_date ? ad.start_date.slice(0, 16) : "");
    setEndDate(ad.end_date ? ad.end_date.slice(0, 16) : "");
    setImageUrl(ad.image_url || "");
    setTargetUrl(ad.target_url || "");
    setHtmlContent(ad.html_content || "");
    setAdsenseClientId(ad.adsense_client_id || "");
    setAdsenseSlotId(ad.adsense_slot_id || "");
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `ads/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const { error } = await supabase.storage.from("article-images").upload(path, file);
      
      if (error) throw error;

      const { data } = supabase.storage.from("article-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success("Banner image uploaded successfully");
    } catch (err: any) {
      toast.error("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      provider,
      status,
      ad_slot: adSlot,
      ad_size: adSize,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      image_url: provider === "custom" || provider === "sponsored" ? imageUrl : null,
      target_url: provider === "custom" || provider === "sponsored" ? targetUrl : null,
      html_content: provider === "other" ? htmlContent : null,
      adsense_client_id: provider === "adsense" ? adsenseClientId.trim() : null,
      adsense_slot_id: provider === "adsense" ? adsenseSlotId.trim() : null,
    };

    try {
      if (editingAd) {
        const { error } = await supabase
          .from("advertisements")
          .update(payload)
          .eq("id", editingAd.id);

        if (error) throw error;
        toast.success("Advertisement updated successfully");
      } else {
        const { error } = await supabase
          .from("advertisements")
          .insert(payload);

        if (error) throw error;
        toast.success("Advertisement created successfully");
      }
      setShowModal(false);
      loadAds();
    } catch (err: any) {
      toast.error("Failed to save advertisement: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (ad: Ad) => {
    const newStatus = ad.status === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("advertisements")
        .update({ status: newStatus })
        .eq("id", ad.id);

      if (error) throw error;
      toast.success(`Advertisement set to ${newStatus}`);
      loadAds();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Advertisement deleted");
      loadAds();
    } catch (err: any) {
      toast.error("Failed to delete ad: " + err.message);
    }
  };

  // Performance calculations
  const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const activeAdsCount = ads.filter((a) => a.status === "active").length;

  // Show loading until auth state is fully resolved (parent admin.tsx handles redirect)
  if (authLoading || !isAdmin) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gradient-gold">Ad Management</h1>
          <p className="text-sm text-muted-foreground">Manage AdSense units, custom fallback banners, and tracking events.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" /> New Advertisement
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Active Ads</span>
            <Megaphone className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{activeAdsCount}</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Impressions</span>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{totalImpressions.toLocaleString()}</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Clicks</span>
            <BarChart3 className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Average CTR</span>
            <span className="text-xs font-semibold text-gold">%</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{averageCTR.toFixed(2)}%</div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-glass-border bg-glass/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Ad Details</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Schedule</th>
                <th className="p-4 text-center">Stats</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading ads...</td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No advertisements configured yet.</td>
                </tr>
              ) : (
                ads.map((ad) => {
                  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
                  return (
                    <tr key={ad.id} className="hover:bg-glass/10 transition">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{ad.title}</div>
                        <div className="text-xs text-muted-foreground">{ad.ad_size}</div>
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                          ad.provider === "adsense" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          ad.provider === "sponsored" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                          ad.provider === "custom" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                          "bg-silver/10 text-silver border border-glass-border"
                        }`}>
                          {ad.provider}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {SLOT_LABELS[ad.ad_slot] || ad.ad_slot}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {ad.start_date || ad.end_date ? (
                          <div className="space-y-0.5">
                            {ad.start_date && <div>Start: {new Date(ad.start_date).toLocaleDateString()}</div>}
                            {ad.end_date && <div>End: {new Date(ad.end_date).toLocaleDateString()}</div>}
                          </div>
                        ) : (
                          "Always Active"
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-xs">Imps: <span className="font-medium text-foreground">{ad.impressions.toLocaleString()}</span></div>
                        <div className="text-xs">Clicks: <span className="font-medium text-foreground">{ad.clicks.toLocaleString()}</span></div>
                        <div className="text-xs text-gold">CTR: <span className="font-medium">{ctr.toFixed(2)}%</span></div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleStatus(ad)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                            ad.status === "active" 
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                          }`}
                        >
                          {ad.status === "active" ? (
                            <><Play className="h-3 w-3 fill-emerald-500" /> Active</>
                          ) : (
                            <><Pause className="h-3 w-3 fill-rose-500" /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(ad)}
                            className="p-1.5 rounded bg-glass text-silver hover:text-gold transition"
                            title="Edit Ad"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ad.id)}
                            className="p-1.5 rounded bg-glass text-silver hover:text-rose-500 transition"
                            title="Delete Ad"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden border border-glass-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-glass-border flex items-center justify-between">
              <h2 className="font-display text-2xl text-gradient-gold">
                {editingAd ? "Edit Advertisement" : "Create Advertisement"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-glass text-silver hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Ad Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Sale Banner"
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Ad["provider"])}
                    className="w-full rounded-lg border border-glass-border bg-navy px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    <option value="adsense">Google AdSense</option>
                    <option value="custom">Custom Image Banner</option>
                    <option value="sponsored">Direct Sponsor Ad</option>
                    <option value="other">Third-Party HTML/Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Placement Slot</label>
                  <select
                    value={adSlot}
                    onChange={(e) => setAdSlot(e.target.value as Ad["ad_slot"])}
                    className="w-full rounded-lg border border-glass-border bg-navy px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    {Object.entries(SLOT_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Ad Size (Width x Height)</label>
                  <input
                    required
                    value={adSize}
                    onChange={(e) => setAdSize(e.target.value)}
                    placeholder="e.g. 970x90"
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Scheduling: Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Scheduling: End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Ad["status"])}
                    className="w-full rounded-lg border border-glass-border bg-navy px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                  >
                    <option value="active">Active (Serve Ad)</option>
                    <option value="inactive">Inactive (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="hairline my-4" />

              {/* Provider-specific conditional inputs */}
              {provider === "adsense" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">AdSense Publisher ID (Client ID)</label>
                    <input
                      required
                      value={adsenseClientId}
                      onChange={(e) => setAdsenseClientId(e.target.value)}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">AdSense Slot ID</label>
                    <input
                      required
                      value={adsenseSlotId}
                      onChange={(e) => setAdsenseSlotId(e.target.value)}
                      placeholder="XXXXXXXXXX"
                      className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(provider === "custom" || provider === "sponsored") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Banner Image</label>
                    <div className="flex gap-3">
                      <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://domain.com/banner.jpg"
                        className="flex-1 rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                      />
                      <label className="flex items-center gap-2 rounded-lg bg-glass border border-glass-border px-4 py-2 text-sm text-silver font-semibold hover:border-gold hover:text-gold cursor-pointer transition">
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload File"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Target Destination URL</label>
                    <input
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://brand-website.com/landing-page"
                      className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {provider === "other" && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Custom HTML/Script Content</label>
                  <textarea
                    required
                    rows={6}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<iframe src='...' /> or script tags..."
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="border-t border-glass-border pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-glass-border bg-transparent px-5 py-2.5 text-sm font-semibold text-silver hover:bg-glass"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-gold/90 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Advertisement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
