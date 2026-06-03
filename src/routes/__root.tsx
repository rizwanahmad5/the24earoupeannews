import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingTicker } from "@/components/BreakingTicker";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-6xl text-gradient-gold">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The 24 European News — Premium News & Culture" },
      { name: "description", content: "Cinematic, modern reporting on news, tech, business, finance, and lifestyle." },
      { property: "og:site_name", content: "The 24 European News" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/white-theme-logo.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const matches = useMatches();
  const isAdminRoute = matches.some((m) => m.fullPath.startsWith("/admin"));

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ParticlesBackground />
      {!isAdminRoute && <BreakingTicker />}
      {!isAdminRoute && <Header />}
      <main className="relative z-10 mx-auto min-h-[60vh] max-w-[1400px] px-4 py-8">
        <Outlet />
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster theme="dark" position="top-right" />
    </QueryClientProvider>
  );
}

