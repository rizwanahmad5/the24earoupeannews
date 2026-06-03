import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Award, Globe2, Users, Newspaper, ShieldCheck, Target, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — The 24 European News" },
      { name: "description", content: "The 24 European News is a premium digital publication delivering cinematic reporting across news, tech, business, finance, and lifestyle." },
      { property: "og:title", content: "About The 24 European News" },
      { property: "og:description", content: "Our mission, values, and the team behind The 24 European News." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const STATS = [
  { label: "Monthly readers", value: "2.4M+" },
  { label: "Stories published", value: "12k" },
  { label: "Countries reached", value: "147" },
  { label: "Awards won", value: "38" },
];

const VALUES = [
  { icon: ShieldCheck, title: "Truth first", text: "Every story is independently verified, sourced, and edited before publication." },
  { icon: Heart, title: "Reader respect", text: "No clickbait. No noise. Just journalism that respects your time and intelligence." },
  { icon: Target, title: "Precision craft", text: "Tight writing, careful design, and a relentless focus on what actually matters." },
  { icon: Globe2, title: "Global lens", text: "Reporters and contributors on six continents bring perspective beyond the headlines." },
];

const TEAM = [
  { name: "Amelia Hart", role: "Editor in Chief", bio: "Former Reuters bureau chief. 18 years covering global affairs and tech policy." },
  { name: "Daniel Okafor", role: "Head of Business", bio: "Ex-Bloomberg markets reporter. Writes the daily Finance briefing." },
  { name: "Yuki Tanaka", role: "Tech Editor", bio: "AI, semiconductors, and the next decade of computing." },
  { name: "Sofia Marchetti", role: "Lifestyle Editor", bio: "Culture, design, and the art of living well in a noisy world." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 py-8">
      {/* Hero */}
      <section className="animate-fade-up text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Since 2019
        </span>
        <h1 className="mt-6 font-display text-5xl leading-tight text-gradient-gold md:text-7xl">
          Journalism, beautifully told.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The 24 European News is a premium digital publication for readers who want clarity over chaos —
          deep reporting, sharp analysis, and design that respects the story.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="glass-card hover-lift rounded-2xl p-6 text-center animate-fade-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="font-display text-4xl text-gradient-gold">{s.value}</div>
            <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className="grid items-center gap-12 md:grid-cols-2">
        <div className="animate-fade-up">
          <div className="text-xs uppercase tracking-widest text-gold">Our mission</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            Cinematic reporting for the curious.
          </h2>
          <div className="prose-article mt-6">
            <p>
              We started The 24 European News with a simple belief: the modern news cycle is loud, but
              wisdom is quiet. Our newsroom is small, our standards are high, and our work is
              built to last longer than the scroll.
            </p>
            <p>
              From breaking technology to the slow craft of lifestyle journalism, every piece is
              shaped by editors who care more about getting it right than getting it first.
            </p>
          </div>
        </div>
        <div className="glass-card hover-tilt grid grid-cols-2 gap-4 rounded-3xl p-6">
          {[Newspaper, Award, Users, Globe2].map((Icon, i) => (
            <div
              key={i}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-glass-border bg-background/40 p-6 text-center transition hover:border-gold/40 hover:bg-gold/5"
            >
              <Icon className="h-8 w-8 text-gold" />
              <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                {["Reporting", "Awarded", "Community", "Worldwide"][i]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-gold">What guides us</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Our values</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="glass-card hover-lift hover-glow group rounded-2xl p-6 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <v.icon className="h-7 w-7 text-gold transition group-hover:scale-110" />
              <h3 className="mt-4 font-display text-xl text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-gold">The newsroom</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Meet the editors</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <div
              key={m.name}
              className="glass-card hover-lift rounded-2xl p-6 text-center animate-scale-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-navy/40 font-display text-2xl text-gold">
                {m.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="mt-4 font-display text-lg text-foreground">{m.name}</h3>
              <div className="text-xs uppercase tracking-widest text-gold">{m.role}</div>
              <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card hover-glow rounded-3xl p-10 text-center md:p-16">
        <h2 className="font-display text-3xl text-gradient-gold md:text-5xl">Have a story to share?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Tips, partnerships, or feedback — we're always listening.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex rounded-full bg-gold px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 hover:shadow-elegant"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}
