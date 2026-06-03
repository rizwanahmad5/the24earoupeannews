import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ArticleEditor = lazy(() =>
  import("@/components/ArticleEditor").then((m) => ({ default: m.ArticleEditor }))
);

export const Route = createFileRoute("/admin/articles/$id/edit")({ component: EditArticle });

function EditArticle() {
  const { id } = useParams({ from: "/admin/articles/$id/edit" });
  const navigate = useNavigate();
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading Editor…</div>}>
      <ArticleEditor articleId={id} onSaved={() => navigate({ to: "/admin/articles" })} />
    </Suspense>
  );
}
