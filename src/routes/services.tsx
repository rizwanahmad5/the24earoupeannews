import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Link2, Globe2, PenLine, BarChart3, Search, FileText, Check,
  Sparkles, Briefcase, TrendingUp, ExternalLink, Target, Shield,
  ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "SEO & Link Building Services — The 24 European News" },
      { name: "description", content: "Premium SEO, backlink building, guest posting, and link building services. Boost your domain authority with high-quality editorial backlinks from The 24 European News." },
      { property: "og:title", content: "The 24 European News — SEO & Link Building Services" },
      { property: "og:description", content: "Drive organic growth with premium guest posts, high-DA backlinks, and expert SEO strategies." },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
});

const SERVICES = [
  {
    icon: Link2,
    title: "High-Authority Backlinks",
    text: "Earn powerful do-follow backlinks from our premium news publication with 60+ Domain Authority. Each link is editorially placed within relevant, high-quality content.",
    tags: ["Do-Follow", "High DA", "Contextual"],
  },
  {
    icon: PenLine,
    title: "Guest Posting",
    text: "Publish expertly written guest articles on The 24 European News and our partner network. We handle writing, editing, and placement for maximum SEO impact.",
    tags: ["Niche Relevant", "Editorial", "Permanent"],
  },
  {
    icon: Globe2,
    title: "Link Building Campaigns",
    text: "Strategic, white-hat link building campaigns tailored to your niche. We acquire links from authoritative domains to boost your rankings sustainably.",
    tags: ["White-Hat", "Scalable", "Outreach"],
  },
  {
    icon: Search,
    title: "On-Page SEO",
    text: "Comprehensive on-page optimization — meta tags, schema markup, content structure, internal linking, keyword mapping, and Core Web Vitals improvement.",
    tags: ["Technical", "Content", "Speed"],
  },
  {
    icon: ExternalLink,
    title: "Off-Page SEO",
    text: "Build your site's authority through strategic link acquisition, brand mentions, social signals, and digital PR across high-trust publications.",
    tags: ["PR", "Authority", "Signals"],
  },
  {
    icon: FileText,
    title: "SEO Content Writing",
    text: "Research-driven, keyword-optimized content that ranks. From pillar pages to blog posts — crafted by journalists who understand both SEO and storytelling.",
    tags: ["Keyword Research", "Pillar Pages", "Blogs"],
  },
  {
    icon: BarChart3,
    title: "SEO Audits & Strategy",
    text: "Deep-dive technical audits, competitor analysis, and custom SEO roadmaps. We identify gaps and build a clear path to page-one rankings.",
    tags: ["Audit", "Competitor", "Roadmap"],
  },
  {
    icon: Target,
    title: "Niche Edits & Link Insertions",
    text: "Get your links naturally inserted into existing, indexed, high-authority articles. Faster results with contextually relevant anchor placement.",
    tags: ["Existing Pages", "Fast Results", "Natural"],
  },
];

const PROCESS = [
  { step: "01", title: "Discovery & Audit", text: "We analyze your current SEO profile, backlink portfolio, competitors, and identify the highest-impact opportunities." },
  { step: "02", title: "Strategy & Planning", text: "Custom SEO roadmap with target keywords, link building targets, content calendar, and measurable KPIs." },
  { step: "03", title: "Execution", text: "Our editorial team creates premium content, secures placements, and builds high-quality links from trusted domains." },
  { step: "04", title: "Reporting & Growth", text: "Monthly performance reports with ranking improvements, DA growth, traffic gains, and ongoing optimization." },
];

const PACKAGES = [
  {
    name: "Starter",
    price: "from $499",
    text: "Perfect for new websites looking to build initial domain authority and organic visibility.",
    features: [
      "2 guest posts on The 24 European News",
      "DA 60+ do-follow backlinks",
      "Keyword research & targeting",
      "Basic on-page SEO audit",
      "Monthly ranking report",
    ],
  },
  {
    name: "Growth",
    featured: true,
    price: "from $1,499",
    text: "Comprehensive SEO and link building for businesses serious about organic growth.",
    features: [
      "5 guest posts across partner network",
      "DA 50-80 backlinks",
      "Full on-page & off-page SEO",
      "Content strategy & writing",
      "Niche edits & link insertions",
      "Weekly ranking reports",
      "Dedicated SEO manager",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    text: "Full-scale SEO partnership for brands that demand category dominance.",
    features: [
      "Unlimited guest posts",
      "DA 70+ premium placements",
      "Complete technical SEO overhaul",
      "Content marketing strategy",
      "Digital PR & brand mentions",
      "Competitor displacement campaigns",
      "Priority support & dedicated team",
    ],
  },
];

const STATS = [
  { target: 90, suffix: "+", label: "Domain Authority" },
  { target: 200, suffix: "M+", label: "Monthly Readers" },
  { target: 500, suffix: "K+", label: "Links Delivered", format: true },
  { target: 98, suffix: "%", label: "Client Retention" },
];

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer — start counting when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Animate count from 0 → target
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return { count, ref };
}

/* ── Individual stat card with animated counter ── */
function StatCard({ stat, index }: { stat: typeof STATS[number]; index: number }) {
  const { count, ref } = useCountUp(stat.target, 2200);
  const display = stat.format ? count.toLocaleString() : count.toString();

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-glass-border bg-card p-6 text-center animate-scale-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="font-display text-4xl text-gold">
        {display}{stat.suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</div>
    </div>
  );
}

/* ────────────────────────────────────────────
   3D Carousel — styles per offset position
   ──────────────────────────────────────────── */
const CAROUSEL_VISIBLE = 5; // total visible cards: -2 -1 0 +1 +2

function getCardStyle(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  const dir = offset > 0 ? 1 : -1;

  if (abs === 0) {
    return {
      transform: "translateX(-50%) translateZ(0px) rotateY(0deg) scale(1)",
      opacity: 1,
      zIndex: 50,
    };
  }
  if (abs === 1) {
    return {
      transform: `translateX(calc(-50% + ${dir * 280}px)) translateZ(-150px) rotateY(${-dir * 30}deg) scale(0.82)`,
      opacity: 0.82,
      zIndex: 40,
    };
  }
  // abs === 2
  return {
    transform: `translateX(calc(-50% + ${dir * 480}px)) translateZ(-300px) rotateY(${-dir * 45}deg) scale(0.65)`,
    opacity: 0.55,
    zIndex: 30,
  };
}

function ServicesPage() {
  const [activeIdx, setActiveIdx] = useState(2);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setActiveIdx((p) => (p >= SERVICES.length - 1 ? 0 : p + 1));
  }, []);
  const prev = useCallback(() => {
    setActiveIdx((p) => (p <= 0 ? SERVICES.length - 1 : p - 1));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [isHovered, next]);

  // Touch swipe support
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-28 py-8">

      {/* ═══════════════════════════════════════════════
          HERO — 3D Perspective Carousel (Screenshot 2)
          ═══════════════════════════════════════════════ */}
      <section className="animate-fade-up text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
          <Briefcase className="h-3.5 w-3.5" /> SEO & Link Building Services
        </span>
        <h1 className="mt-6 font-display text-5xl leading-tight text-gradient-gold md:text-7xl">
          HR SEO Agency &<br />Link Building Services
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Scroll to explore our comprehensive solutions designed for search dominance.
        </p>

        {/* ── 3D Stage ── */}
        <div
          className="relative mx-auto mt-16 overflow-hidden"
          style={{ height: 460 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Perspective container */}
          <div
            className="relative mx-auto h-full w-full max-w-5xl"
            style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
          >
            {SERVICES.map((s, i) => {
              let offset = i - activeIdx;
              if (offset > SERVICES.length / 2) offset -= SERVICES.length;
              if (offset < -SERVICES.length / 2) offset += SERVICES.length;
              if (Math.abs(offset) > 2) return null;

              const style = getCardStyle(offset);
              const isCenter = offset === 0;

              return (
                <div
                  key={s.title}
                  className="absolute left-1/2 top-4"
                  style={{
                    width: 300,
                    ...style,
                    transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                    transformStyle: "preserve-3d",
                    pointerEvents: isCenter ? "auto" : "auto",
                  }}
                >
                  <button
                    onClick={() => setActiveIdx(i)}
                    className="block w-full text-left"
                  >
                    <div
                      className="rounded-2xl border p-7 backdrop-blur-sm transition-all duration-700"
                      style={{
                        height: 360,
                        display: "flex",
                        flexDirection: "column",
                        background: isCenter
                          ? "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,16,30,0.98))"
                          : "linear-gradient(145deg, rgba(15,23,42,0.7), rgba(10,16,30,0.8))",
                        borderColor: isCenter
                          ? "rgba(212,175,55,0.45)"
                          : "rgba(255,255,255,0.06)",
                        boxShadow: isCenter
                          ? "0 0 50px -10px rgba(212,175,55,0.2), inset 0 1px 0 rgba(212,175,55,0.1)"
                          : "none",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center rounded-xl transition-all duration-600"
                        style={{
                          width: 52,
                          height: 52,
                          background: isCenter
                            ? "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))"
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isCenter ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)"}`,
                          color: isCenter ? "rgb(212,175,55)" : "rgba(160,170,190,0.6)",
                          boxShadow: isCenter ? "0 0 20px -6px rgba(212,175,55,0.3)" : "none",
                        }}
                      >
                        <s.icon style={{ width: 22, height: 22 }} />
                      </div>

                      {/* Title */}
                      <h3
                        className="mt-5 font-display text-xl leading-snug transition-colors duration-500"
                        style={{ color: isCenter ? "rgba(255,255,255,0.95)" : "rgba(160,170,190,0.7)" }}
                      >
                        {s.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="mt-3 text-sm leading-relaxed transition-all duration-500"
                        style={{
                          color: isCenter ? "rgba(160,170,190,0.85)" : "rgba(130,140,160,0.5)",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {s.text}
                      </p>

                      {/* Learn More */}
                      <div className="mt-auto pt-4">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-500"
                          style={{
                            borderColor: isCenter ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)",
                            background: isCenter ? "rgba(212,175,55,0.08)" : "transparent",
                            color: isCenter ? "rgb(212,175,55)" : "rgba(160,170,190,0.4)",
                          }}
                        >
                          Learn More
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Perspective Grid Floor ── */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: "140%",
              height: 180,
              transformStyle: "preserve-3d",
              perspective: "600px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                transform: "rotateX(65deg) translateY(30px)",
                backgroundImage:
                  "linear-gradient(to right, rgba(212,175,55,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,175,55,0.06) 1px, transparent 1px)",
                backgroundSize: "60px 40px",
                maskImage: "radial-gradient(ellipse 70% 100% at 50% 0%, black 20%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 50% 0%, black 20%, transparent 70%)",
              }}
            />
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-[60] -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-background/70 text-silver backdrop-blur-md transition-all hover:border-gold hover:text-gold md:left-4"
            aria-label="Previous service"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-[60] -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-background/70 text-silver backdrop-blur-md transition-all hover:border-gold hover:text-gold md:right-4"
            aria-label="Next service"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {SERVICES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all duration-500 ${i === activeIdx
                ? "h-2 w-8 bg-gold shadow-[0_0_10px_0] shadow-gold/50"
                : "h-2 w-2 bg-silver/25 hover:bg-silver/50"
                }`}
              aria-label={`Service ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/50">
            Get started today
          </Link>
          <a href="#packages" className="rounded-full border border-glass-border bg-glass px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold/40 hover:text-gold">
            View packages
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Stats bar — Animated counters
          ═══════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Why The 24 European News
          ═══════════════════════════════════════════ */}
      <section className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Why The 24 European News</div>
        <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Real editorial links. Real results.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Unlike link farms and PBNs, every backlink from The 24 European News is editorially placed within genuine, high-quality
          journalism. Google trusts our domain because we publish real content read by real people.
        </p>
        <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
          {[
            { icon: Shield, title: "Google-Safe & White-Hat", desc: "Every link is earned through quality content — no PBNs, no spam, no penalties. Fully compliant with Google's guidelines." },
            { icon: TrendingUp, title: "Measurable SEO Impact", desc: "Our clients see an average 40% increase in organic traffic within 90 days. We track rankings, DA growth, and referral traffic." },
            { icon: Globe2, title: "Premium Publication Network", desc: "Access backlinks from The 24 European News and our curated network of 100+ high-authority sites across multiple industries." },
          ].map((item, i) => (
            <div key={item.title} className="group rounded-2xl border border-glass-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/25" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-glass-border bg-gold/10 text-gold transition group-hover:bg-gold/20 group-hover:border-gold/30">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          Process — How it works
          ═══════════════════════════════════════════ */}
      <section>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">How it works</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Simple. Transparent. Effective.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <div
              key={p.step}
              className="relative overflow-hidden rounded-2xl border border-glass-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/25 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="font-display text-5xl text-gold/15">{p.step}</div>
              <h3 className="mt-3 font-display text-lg text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              {i < PROCESS.length - 1 && (
                <ArrowRight className="absolute right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gold/20 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Packages
          ═══════════════════════════════════════════ */}
      <section id="packages">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Packages</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Invest in your rankings</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Flexible packages designed for businesses at every stage. All plans include permanent, do-follow backlinks.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <div
              key={pkg.name}
              className={`relative rounded-2xl border bg-card p-8 transition-all duration-500 hover:-translate-y-1 animate-scale-in ${pkg.featured
                ? "border-gold/40 shadow-[0_0_50px_-12px] shadow-gold/25"
                : "border-glass-border"
                }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="text-xs uppercase tracking-widest text-gold">{pkg.name}</div>
              <div className="mt-3 font-display text-3xl text-foreground">{pkg.price}</div>
              <p className="mt-3 text-sm text-muted-foreground">{pkg.text}</p>
              <ul className="mt-6 space-y-2.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-8 inline-flex w-full justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${pkg.featured
                  ? "bg-gold text-primary-foreground hover:scale-105 hover:shadow-[0_0_30px_-6px] hover:shadow-gold/50"
                  : "border border-glass-border bg-glass text-foreground hover:border-gold/40 hover:text-gold"
                  }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="rounded-3xl border border-glass-border bg-card p-10 text-center md:p-16">
        <Sparkles className="mx-auto h-8 w-8 text-gold" />
        <h2 className="mt-4 font-display text-3xl text-gradient-gold md:text-5xl">Ready to rank on page one?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Tell us about your SEO goals and we'll create a custom strategy to boost your rankings, traffic, and domain authority.
          Free consultation — no commitment.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex rounded-full bg-gold px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/50"
        >
          Book free consultation
        </Link>
      </section>
    </div>
  );
}
