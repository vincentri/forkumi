"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "~/lib/trpc/client";

const FALLBACK_ERROR_MESSAGE = "Unable to subscribe. Please try again.";

type SubscribeNewsletterMutation = {
  isPending: boolean;
  mutateAsync: (input: { email: string }) => Promise<unknown>;
};

type NewsletterApi = {
  public: {
    subscribeNewsletter: {
      useMutation: () => SubscribeNewsletterMutation;
    };
  };
};

const newsletterApi = api as unknown as NewsletterApi;

function getErrorMessage(error: unknown): string {
  const message = (error as Error)?.message;

  if (!message) {
    return FALLBACK_ERROR_MESSAGE;
  }

  try {
    const issues = JSON.parse(message);
    if (Array.isArray(issues)) {
      const issueMessage = issues.find(
        (issue): issue is { message: string } =>
          issue && typeof issue === "object" && typeof issue.message === "string",
      )?.message;

      if (issueMessage) {
        return issueMessage;
      }
    }
  } catch {
    return message;
  }

  return message;
}

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const subscribe = newsletterApi.public.subscribeNewsletter.useMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await subscribe.mutateAsync({ email });
      setEmail("");
      setMessage("You are subscribed. Thank you.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl" noValidate>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-xl border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {subscribe.isPending ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
