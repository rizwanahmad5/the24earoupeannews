import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: () => (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl text-gradient-gold">Terms &amp; Conditions</h1>
      <div className="prose-article mt-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Acceptance</h2>
        <p>By using The 24 European News you agree to these terms.</p>
        <h2>Use of content</h2>
        <p>All articles, imagery, and design elements are © The 24 European News unless otherwise stated. You may share links and short excerpts with attribution.</p>
        <h2>User-submitted comments</h2>
        <p>You retain ownership of comments you post, but grant The 24 European News a perpetual license to display them. We reserve the right to moderate or remove any submission.</p>
        <h2>Disclaimer</h2>
        <p>Content is provided "as is" without warranty. The 24 European News is not liable for decisions made based on its content.</p>
      </div>
    </div>
  ),
  head: () => ({ meta: [{ title: "Terms & Conditions — The 24 European News" }, { name: "description", content: "The 24 European News terms and conditions." }], links: [{ rel: "canonical", href: "/terms" }] }),
});
