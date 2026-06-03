import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  size: string;
  className?: string;
}

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
}

const SLOT_MAP: Record<string, { id: Ad["ad_slot"]; size: string }> = {
  "970x90 — Header Banner": { id: "header_banner", size: "970x90" },
  "728x250 — Mid Page": { id: "mid_page", size: "728x250" },
  "300x600 — Sidebar": { id: "sidebar", size: "300x600" },
  "970x90 — Footer Banner": { id: "footer_banner", size: "970x90" },
  "728x90 — Mid Article": { id: "mid_article", size: "728x90" },
  "728x90 — End of Article": { id: "end_article", size: "728x90" },
};

export function AdSlot({ size, className = "" }: AdSlotProps) {
  const slotInfo = SLOT_MAP[size] || { id: size as Ad["ad_slot"], size: size.split(" — ")[0] };
  const slotId = slotInfo.id;

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const hasTrackedImpression = useRef<string | null>(null);

  useEffect(() => {
    async function loadAds() {
      try {
        const { data, error } = await supabase
          .from("advertisements")
          .select("*")
          .eq("status", "active")
          .eq("ad_slot", slotId);

        if (error) throw error;

        // Filter scheduled dates client-side
        const now = new Date();
        const activeAds = (data || []).filter((ad: any) => {
          const start = ad.start_date ? new Date(ad.start_date) : null;
          const end = ad.end_date ? new Date(ad.end_date) : null;
          if (start && start > now) return false;
          if (end && end < now) return false;
          return true;
        });

        setAds(activeAds as Ad[]);
      } catch (err) {
        console.error("Error loading ads for slot", slotId, err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, [slotId]);

  useEffect(() => {
    if (loading) return;

    const adsenseAd = ads.find((a) => a.provider === "adsense");
    const fallbackAds = ads.filter((a) => a.provider !== "adsense");

    if (!useFallback && adsenseAd) {
      setCurrentAd(adsenseAd);
    } else if (fallbackAds.length > 0) {
      // Pick a random fallback ad for rotation
      const randomAd = fallbackAds[Math.floor(Math.random() * fallbackAds.length)];
      setCurrentAd(randomAd);
    } else {
      setCurrentAd(null);
    }
  }, [ads, loading, useFallback]);

  // Handle Google AdSense initialization and fallback detection
  useEffect(() => {
    if (!currentAd || currentAd.provider !== "adsense") return;

    // Inject global adsbygoogle script if it doesn't exist
    const scriptId = "adsense-global-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${currentAd.adsense_client_id}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => {
        console.warn("AdSense script failed to load. Falling back.");
        setUseFallback(true);
      };
      document.head.appendChild(script);
    }

    // Try executing the push
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error. Falling back.", e);
      setUseFallback(true);
      return;
    }

    // Check for load success or empty fill after 2.5s
    const checkTimeout = setTimeout(() => {
      const insEl = document.querySelector(`ins[data-ad-slot="${currentAd.adsense_slot_id}"]`);
      if (insEl) {
        const status = insEl.getAttribute("data-ad-status");
        const hasIframe = insEl.querySelector("iframe");
        if (status === "unfilled" || (!hasIframe && !status)) {
          console.warn("AdSense returned no fill or timed out. Falling back.");
          setUseFallback(true);
        }
      } else {
        setUseFallback(true);
      }
    }, 2500);

    return () => clearTimeout(checkTimeout);
  }, [currentAd]);

  // Track impression for custom/sponsored ads
  useEffect(() => {
    if (!currentAd || currentAd.provider === "adsense") return;
    if (hasTrackedImpression.current === currentAd.id) return;

    hasTrackedImpression.current = currentAd.id;
    supabase.rpc("track_ad_event", { ad_id: currentAd.id, event_type: "impression" })
      .catch((err) => console.error("Error tracking ad impression:", err));
  }, [currentAd]);

  const handleAdClick = () => {
    if (!currentAd) return;
    supabase.rpc("track_ad_event", { ad_id: currentAd.id, event_type: "click" })
      .catch((err) => console.error("Error tracking ad click:", err));
  };

  // If loading or no advertisement is active/filled, return null to collapse container completely
  if (loading || !currentAd) {
    return null;
  }

  if (currentAd.provider === "adsense") {
    return (
      <div className={`flex justify-center overflow-hidden ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "auto" }}
          data-ad-client={currentAd.adsense_client_id ?? undefined}
          data-ad-slot={currentAd.adsense_slot_id ?? undefined}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (currentAd.provider === "custom" || currentAd.provider === "sponsored") {
    return (
      <div className={`relative flex justify-center ${className}`}>
        <a
          href={currentAd.target_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          className="group block w-full overflow-hidden rounded-xl border border-glass-border bg-glass/20 transition duration-300 hover:border-gold/30 hover:bg-glass/40"
        >
          <img
            src={currentAd.image_url || ""}
            alt={currentAd.title}
            className="h-auto w-full object-contain mx-auto"
            style={{ maxHeight: slotInfo.size.split("x")[1] ? `${slotInfo.size.split("x")[1]}px` : "250px" }}
          />
        </a>
        <span className="absolute bottom-1 right-2 rounded bg-black/60 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/60 select-none">
          Sponsored
        </span>
      </div>
    );
  }

  if (currentAd.provider === "other" && currentAd.html_content) {
    return (
      <div
        className={`flex justify-center ${className}`}
        dangerouslySetInnerHTML={{ __html: currentAd.html_content }}
      />
    );
  }

  return null;
}
