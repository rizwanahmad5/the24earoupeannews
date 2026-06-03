import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "luminapost-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as
      | "dark"
      | "light"
      | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
    }
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass text-silver transition hover:text-gold"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
