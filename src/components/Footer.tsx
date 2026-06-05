import { Link } from "@tanstack/react-router";
import { AdSlot } from "./AdSlot";
import { AdminsShowcase } from "./AdminsShowcase";
import { useState, useEffect } from "react";
import { Newspaper, Building2, Scale, Shield } from "lucide-react";

const FOOTER_TABS = [
  { id: "sections", label: "Sections", icon: Newspaper },
  { id: "company", label: "Company", icon: Building2 },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "admins", label: "Admins", icon: Shield },
] as const;

type TabId = typeof FOOTER_TABS[number]["id"];

export function Footer() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<TabId>("sections");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initialTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(initialTheme);

    const handleThemeChange = (e: Event) => {
      setTheme((e as CustomEvent).detail);
    };
    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  return (
    <footer className="mt-20 border-t border-glass-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <AdSlot size="970x90 — Footer Banner" />
        </div>

        {/* ── Mobile tab navigation ── */}
        <div className="mb-6 flex items-center justify-center gap-1 rounded-2xl border border-glass-border bg-glass/30 p-1.5 backdrop-blur-md md:hidden">
          {FOOTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-500 ${
                  isActive
                    ? "text-gold"
                    : "text-silver/50 hover:text-silver"
                }`}
              >
                {/* Active glow background */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))",
                      border: "1px solid rgba(212,175,55,0.2)",
                      boxShadow: "0 0 20px -6px rgba(212,175,55,0.2), inset 0 1px 0 rgba(212,175,55,0.1)",
                    }}
                  />
                )}
                <tab.icon className={`relative h-4 w-4 transition-all duration-500 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Desktop: full grid | Mobile: tab content ── */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-10">
          {/* Column 1: Brand & Sections */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="flex items-center gap-2">
              <img src={theme === "light" ? "/white-theme-logo.png" : "/logo.png"} alt="The 24 European News" className="h-14 w-auto object-contain" />
              <span className="font-display text-lg text-gradient-gold">The 24 European News</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed pr-8">
              Premium reporting on the stories shaping tomorrow.
            </p>
          </div>

          {/* Column 2: Company */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Company</div>
            <ul className="space-y-2 text-sm text-silver/80">
              <li><Link to="/about" className="hover:text-gold transition">About</Link></li>
              <li><Link to="/services" className="hover:text-gold transition">Services</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Legal</div>
            <ul className="space-y-2 text-sm text-silver/80">
              <li><Link to="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Column 4: Admins showcase */}
          <div className="md:col-span-4 lg:col-span-4 flex lg:justify-end">
            <div className="w-full max-w-[320px]">
              <AdminsShowcase />
            </div>
          </div>
        </div>

        {/* ── Mobile tab content ── */}
        <div className="md:hidden">
          {activeTab === "sections" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <img src={theme === "light" ? "/white-theme-logo.png" : "/logo.png"} alt="The 24 European News" className="h-12 w-auto object-contain" />
                <span className="font-display text-lg text-gradient-gold">The 24 European News</span>
              </div>
              <ul className="grid grid-cols-2 gap-2 text-sm text-silver/80">
                <li><Link to="/category/news" className="hover:text-gold transition">News</Link></li>
                <li><Link to="/category/pet-news" className="hover:text-gold transition">Pet News</Link></li>
                <li><Link to="/category/tech" className="hover:text-gold transition">Tech &amp; AI</Link></li>
                <li><Link to="/category/lifestyle" className="hover:text-gold transition">Lifestyle</Link></li>
                <li><Link to="/category/business" className="hover:text-gold transition">Business</Link></li>
                <li><Link to="/category/finance" className="hover:text-gold transition">Finance</Link></li>
              </ul>
            </div>
          )}

          {activeTab === "company" && (
            <div className="animate-fade-in">
              <ul className="space-y-3 text-sm text-silver/80">
                <li><Link to="/about" className="hover:text-gold transition">About</Link></li>
                <li><Link to="/services" className="hover:text-gold transition">Services</Link></li>
                <li><Link to="/contact" className="hover:text-gold transition">Contact</Link></li>
              </ul>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="animate-fade-in">
              <ul className="space-y-3 text-sm text-silver/80">
                <li><Link to="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-gold transition">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="animate-fade-in">
              <AdminsShowcase />
            </div>
          )}
        </div>

        <div className="hairline mt-6" />
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} The 24 European News. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
