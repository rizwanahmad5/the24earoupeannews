import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Clock, Send, MessageCircle, Briefcase, Newspaper } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — The 24 European News" },
      { name: "description", content: "Get in touch with the The 24 European News team — press, partnerships, tips, or feedback." },
      { property: "og:title", content: "Contact The 24 European News" },
      { property: "og:description", content: "Reach our editorial, partnerships, and press teams." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const CHANNELS = [
  { icon: Newspaper, title: "Editorial & tips", email: "tips@the24europeannews.com", text: "Story leads, exclusives, and corrections." },
  { icon: Briefcase, title: "Partnerships", email: "partners@the24europeannews.com", text: "Brand collaborations and sponsorships." },
  { icon: MessageCircle, title: "Press & PR", email: "press@the24europeannews.com", text: "Media inquiries about The 24 European News." },
];

const INFO = [
  { icon: MapPin, title: "Headquarters", text: "27 Aurora Lane, London EC2A 3LT" },
  { icon: Phone, title: "Call us", text: "+92 303 5235786" },
  { icon: Clock, title: "Hours", text: "Mon–Fri · 9:00 – 18:00 GMT" },
];

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent — we'll be in touch shortly.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setSending(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-20 py-8">
      {/* Hero */}
      <section className="animate-fade-up text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-widest text-gold">
          <Mail className="h-3.5 w-3.5" /> We'd love to hear from you
        </span>
        <h1 className="mt-6 font-display text-5xl leading-tight text-gradient-gold md:text-7xl">
          Let's talk.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Tips, partnerships, press, or just a hello — every message reaches a real human in our newsroom.
        </p>
      </section>

      {/* Channels */}
      <section className="grid gap-6 md:grid-cols-3">
        {CHANNELS.map((c, i) => (
          <a
            key={c.title}
            href={`mailto:${c.email}`}
            className="glass-card hover-lift hover-glow group rounded-2xl p-6 animate-fade-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <c.icon className="h-7 w-7 text-gold transition group-hover:scale-110" />
            <h3 className="mt-4 font-display text-xl text-foreground">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            <div className="story-link mt-4 inline-block text-sm font-medium text-gold">{c.email}</div>
          </a>
        ))}
      </section>

      {/* Form + info */}
      <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={submit}
          className="glass-card hover-glow animate-fade-up space-y-5 rounded-3xl p-8 md:p-10"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">Send a message</div>
            <h2 className="mt-2 font-display text-3xl text-foreground">Drop us a line</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
                placeholder="you@email.com"
                className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              placeholder="What's this about?"
              className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              required
              rows={6}
              placeholder="Tell us more…"
              className="w-full resize-none rounded-lg border border-glass-border bg-background/40 px-4 py-2.5 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 hover:shadow-elegant disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>

        <div className="space-y-5">
          {INFO.map((info, i) => (
            <div
              key={info.title}
              className="glass-card hover-lift flex items-start gap-4 rounded-2xl p-6 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <info.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg text-foreground">{info.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{info.text}</div>
              </div>
            </div>
          ))}
          <div className="glass-card hover-glow rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-gold">Response time</div>
            <p className="mt-2 text-sm text-muted-foreground">
              We reply to most messages within one business day. Press inquiries are prioritized.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
