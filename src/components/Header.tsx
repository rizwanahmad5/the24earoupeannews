import { Link } from "@tanstack/react-router";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";

/** Primary nav items shown directly in the header */
const PRIMARY_NAV = [
  { to: "/", label: "Home" },
  { to: "/category/international-news", label: "International" },
  { to: "/category/tech", label: "Tech" },
  { to: "/category/business", label: "Business" },
];

/** Items inside the "More" dropdown — all remaining categories */
const MORE_NAV = [
  { to: "/category/news", label: "Trending News" },
  { to: "/category/politics", label: "Politics" },
  { to: "/category/health", label: "Health" },
  { to: "/category/entertainment", label: "Entertainment" },
  { to: "/category/lifestyle", label: "Lifestyle" },
  { to: "/category/finance", label: "Finance" },
  { to: "/category/pet-news", label: "Pet News" },
];

/** Static pages after the More dropdown */
const STATIC_NAV = [
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
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

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-glass-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <img src={theme === "light" ? "/white-theme-logo.png" : "/logo.png"} alt="The 24 European News" className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display text-lg tracking-tight text-gradient-gold hidden sm:inline-block">
            The 24 European News
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-capsule"
              activeProps={{ className: "nav-capsule-active" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`nav-capsule inline-flex items-center gap-1 ${moreOpen ? "nav-capsule-active" : ""}`}
            >
              More
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 animate-fade-up rounded-xl border border-glass-border bg-background/95 backdrop-blur-xl shadow-elegant overflow-hidden z-50">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-silver/90 transition hover:bg-gold/10 hover:text-gold"
                    activeProps={{ className: "text-gold bg-gold/5" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {STATIC_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-capsule"
              activeProps={{ className: "nav-capsule-active" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass text-silver transition hover:text-gold"
          >
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass text-silver transition hover:text-gold lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-glass-border bg-background/90 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-silver/90 transition hover:bg-gold/10 hover:text-gold"
                activeProps={{ className: "text-gold bg-gold/10" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile More — expandable */}
            <button
              onClick={() => setMobileMoreOpen((v) => !v)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-silver/90 transition hover:bg-gold/10 hover:text-gold"
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileMoreOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileMoreOpen && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-glass-border pl-3">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => { setMobileOpen(false); setMobileMoreOpen(false); }}
                    className="rounded-lg px-3 py-2 text-sm text-silver/90 transition hover:bg-gold/10 hover:text-gold"
                    activeProps={{ className: "text-gold bg-gold/10" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {STATIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-silver/90 transition hover:bg-gold/10 hover:text-gold"
                activeProps={{ className: "text-gold bg-gold/10" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
