"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function GuestSignInForm() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await signIn("guest", { name, redirect: false });
    // Full navigation (not router.push) so the layout re-reads the fresh
    // session cookie server-side instead of reusing Next.js's client router
    // cache, which would otherwise leave the navbar showing "Sign in" for a
    // few seconds after a successful guest sign-in.
    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full border border-border py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Continue as Guest"}
      </button>
    </form>
  );
}
