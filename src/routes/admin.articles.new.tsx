import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy, Suspense } from "react";

const ArticleEditor = lazy(() =>
  import("@/components/ArticleEditor").then((m) => ({ default: m.ArticleEditor }))
);

export const Route = createFileRoute("/admin/articles/new")({ component: NewArticle });

function NewArticle() {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading Editor…</div>}>
      <ArticleEditor onSaved={() => navigate({ to: "/admin/articles" })} />
    </Suspense>
  );
}
