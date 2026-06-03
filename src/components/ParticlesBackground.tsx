// Lightweight CSS-only starfield as the animated background.
// Avoids version-coupling issues between @tsparticles packages.
import { useMemo } from "react";

interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

export function ParticlesBackground() {
  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    for (let i = 0; i < 120; i++) {
      arr.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.4,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 6,
        color: Math.random() > 0.85 ? "#D4AF37" : "#C0C0C0",
      });
    }
    return arr;
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.22 0.06 270) 0%, oklch(0.12 0.03 270) 60%, oklch(0.08 0.02 270) 100%)",
      }}
    >
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full animate-float-slow"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 ${s.size * 4}px ${s.color}`,
              opacity: 0.6,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{ background: "oklch(0.35 0.15 270 / 0.25)" }}
      />
      <div
        className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-3xl"
        style={{ background: "oklch(0.78 0.13 85 / 0.12)" }}
      />
    </div>
  );
}
