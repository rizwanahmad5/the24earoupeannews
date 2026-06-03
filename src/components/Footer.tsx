import { Link } from "@tanstack/react-router";
import { AdSlot } from "./AdSlot";
import { useState, useEffect } from "react";

export function Footer() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
    <footer className="mt-24 border-t border-glass-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="mb-10">
          <AdSlot size="970x90 — Footer Banner" />
        </div>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={theme === "light" ? "/white-theme-logo.png" : "/logo.png"} alt="The 24 European News" className="h-16 w-auto object-contain" />
              <span className="font-display text-xl text-gradient-gold">The 24 European News</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Premium reporting on the stories shaping tomorrow.
            </p>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Sections</div>
            <ul className="space-y-2 text-sm text-silver/80">
              <li><Link to="/category/news" className="hover:text-gold">News</Link></li>
              <li><Link to="/category/pet-news" className="hover:text-gold">Pet News</Link></li>
              <li><Link to="/category/tech" className="hover:text-gold">Tech &amp; AI</Link></li>
              <li><Link to="/category/lifestyle" className="hover:text-gold">Lifestyle</Link></li>
              <li><Link to="/category/business" className="hover:text-gold">Business</Link></li>
              <li><Link to="/category/finance" className="hover:text-gold">Finance</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Company</div>
            <ul className="space-y-2 text-sm text-silver/80">
              <li><Link to="/about" className="hover:text-gold">About</Link></li>
              <li><Link to="/services" className="hover:text-gold">Services</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Legal</div>
            <ul className="space-y-2 text-sm text-silver/80">
              <li><Link to="/privacy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="hairline mt-10" />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} The 24 European News. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
