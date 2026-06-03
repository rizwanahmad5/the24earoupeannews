import { Copy, Facebook, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const buttons = [
    {
      label: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodedTitle}%20${encoded}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Share</span>
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${b.label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass text-silver transition hover:text-gold"
        >
          <b.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass text-silver transition hover:text-gold"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}
