import { useEffect, useRef, useState, useCallback } from "react";
import { Shield, Star, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Premium Admins Showcase — World-class Typewriter + 3D
   ═══════════════════════════════════════════════════════ */

const ADMINS = [
  { name: "Dr Rizwan Ahmad", role: "Founder & CEO", status: "online" },
  { name: "Hina Rasheed", role: "Managing Editor", status: "active" },
];

/* ── Typewriter hook with realistic speed variation ── */
function useTypewriter(names: string[], typingSpeed = 90, pauseMs = 2200) {
  const [display, setDisplay] = useState("");
  const [nameIdx, setNameIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting">("typing");
  const [charIdx, setCharIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const currentName = names[nameIdx];

    if (phase === "typing") {
      if (charIdx <= currentName.length) {
        const variation = typingSpeed + (Math.random() * 60 - 30); // realistic speed jitter
        const timer = setTimeout(() => {
          setDisplay(currentName.slice(0, charIdx));
          if (charIdx === currentName.length) {
            setIsComplete(true);
            setPhase("paused");
          } else {
            setCharIdx((c) => c + 1);
          }
        }, variation);
        return () => clearTimeout(timer);
      }
    }

    if (phase === "paused") {
      const timer = setTimeout(() => {
        setIsComplete(false);
        setPhase("deleting");
      }, pauseMs);
      return () => clearTimeout(timer);
    }

    if (phase === "deleting") {
      if (display.length > 0) {
        const timer = setTimeout(() => {
          setDisplay((d) => d.slice(0, -1));
        }, 40);
        return () => clearTimeout(timer);
      } else {
        setNameIdx((i) => (i + 1) % names.length);
        setCharIdx(0);
        setPhase("typing");
      }
    }
  }, [phase, charIdx, display, nameIdx, names, typingSpeed, pauseMs]);

  return { display, nameIdx, isComplete };
}

/* ── Floating particles ── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; color: string }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? "212,175,55" : "192,192,192",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.o})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, `rgba(${p.color},${p.o * 0.3})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ── Main AdminsShowcase component ── */
export function AdminsShowcase() {
  const { display, nameIdx, isComplete } = useTypewriter(
    ADMINS.map((a) => a.name),
    85,
    2400
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mouseInside, setMouseInside] = useState(false);

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  }, []);

  return (
    <div className="flex w-full flex-col">
      {/* ── Permanent Names Section ── */}
      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gold" />
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Administration
          </h3>
        </div>
        <div className="mb-4 h-[1px] w-full bg-gradient-to-r from-glass-border to-transparent" />

        <ul className="space-y-3">
          {ADMINS.map((admin) => (
            <li key={admin.name} className="group flex items-start justify-between">
              <div>
                <div className="font-display text-sm text-foreground transition-colors group-hover:text-gold">{admin.name}</div>
                <div className="text-xs text-muted-foreground">{admin.role}</div>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{
                      backgroundColor: admin.status === "online" ? "rgb(34,197,94)" : "rgb(234,179,8)",
                      animation: "admins-status-ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: admin.status === "online" ? "rgb(34,197,94)" : "rgb(234,179,8)",
                    }}
                  />
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {admin.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Animated Showcase Area ── */}
      <div className="mt-1">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Featured Profile
        </h3>
        <div className="mb-4 h-[1px] w-full bg-gradient-to-r from-glass-border to-transparent" />

        <div
          ref={cardRef}
          className="group relative w-full cursor-default"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setMouseInside(true)}
          onMouseLeave={() => { setMouseInside(false); setTilt({ x: 0, y: 0 }); }}
          style={{ perspective: "1000px" }}
        >
          <div
            className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-700 ease-out bg-card/90 ${isComplete
              ? "border-gold/40 shadow-[0_10px_40px_-10px] shadow-gold/20"
              : "border-glass-border shadow-2xl shadow-black/5"
              }`}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0) ${mouseInside ? "scale(1.02)" : "scale(1)"}`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Particles Background inside the card */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isComplete ? "opacity-40" : "opacity-10"}`}>
              <Particles />
            </div>

            {/* Premium glass reflection */}
            <div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
              style={{
                background: mouseInside
                  ? `radial-gradient(300px circle at ${50 + tilt.y * 3}% ${50 + tilt.x * 3}%, var(--color-gold), transparent 60%)`
                  : "none",
                opacity: 0.08,
                transition: "background 0.3s ease-out",
              }}
            />

            {/* Card Content */}
            <div className="relative z-10 text-center">
              {/* Admin icon */}
              <div className="relative mx-auto mb-3 flex h-10 w-10 items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-700 ${isComplete
                    ? "bg-gold/10 border border-gold/40 shadow-[0_0_20px_-5px] shadow-gold/40"
                    : "bg-muted border border-glass-border shadow-none"
                    }`}
                />
                <Star
                  className={`relative h-4 w-4 transition-colors duration-500 ${isComplete ? "text-gold" : "text-muted-foreground/50"
                    }`}
                />
              </div>

              {/* Typewriter name */}
              <div className="relative flex min-h-[36px] items-center justify-center">
                <h4
                  className="font-display text-xl md:text-2xl transition-all duration-500"
                  style={isComplete ? {
                    background: "linear-gradient(110deg, var(--color-foreground) 35%, rgba(220,195,110,0.6) 50%, var(--color-foreground) 65%)",
                    backgroundSize: "250% auto",
                    color: "transparent",
                    WebkitBackgroundClip: "text",
                    animation: "name-sweep 7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
                  } : {
                    color: "var(--color-foreground)",
                  }}
                >
                  {display}
                  <span
                    className="ml-0.5 inline-block w-[2px] align-baseline"
                    style={{
                      height: "1em",
                      background: "var(--color-gold)",
                      animation: "admins-blink 1s step-end infinite",
                      boxShadow: "0 0 8px rgba(212,175,55,0.5)",
                    }}
                  />
                </h4>
              </div>

              {/* Admin badge */}
              <div className="mt-3 flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-widest transition-all duration-700 ${isComplete
                    ? "border-gold/30 text-gold bg-gold/5"
                    : "border-glass-border text-muted-foreground/60 bg-transparent"
                    }`}
                >
                  <Sparkles className="h-2 w-2" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes name-sweep {
          0% { 
            background-position: -100% center; 
            filter: drop-shadow(0 0 0px transparent);
          }
          20% {
            filter: drop-shadow(0 0 4px rgba(212,175,55,0.15));
          }
          80% {
            filter: drop-shadow(0 0 4px rgba(212,175,55,0.15));
          }
          100% { 
            background-position: 200% center; 
            filter: drop-shadow(0 0 0px transparent);
          }
        }
        @keyframes admins-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes admins-status-ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
