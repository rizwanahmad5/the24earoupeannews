import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl text-gradient-gold">Privacy Policy</h1>
      <div className="prose-article mt-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Information we collect</h2>
        <p>We collect minimal personal data: email addresses you provide for our newsletter, comments you submit (which are publicly visible), and basic analytics about page visits.</p>
        <h2>Cookies & advertising</h2>
        <p>The 24 European News uses cookies for essential site functionality and analytics. Third-party advertising partners (including Google AdSense) may set cookies to serve ads relevant to your interests.</p>
        <h2>Your rights</h2>
        <p>You may request deletion of any personal data we hold about you by contacting us.</p>
        <h2>Contact</h2>
        <p>Questions about this policy? Reach us via the contact page.</p>
      </div>
    </div>
  ),
  head: () => ({ meta: [{ title: "Privacy Policy — The 24 European News" }, { name: "description", content: "The 24 European News privacy policy." }], links: [{ rel: "canonical", href: "/privacy" }] }),
});
