"use client";

import { useState, type FormEvent, type ReactElement } from "react";

type ContactFormProps = {
  nameLabel: string;
  emailLabel: string;
  pkgLabel: string;
  pkgOptions: string[];
  pkgPlaceholder: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  nameLabel,
  emailLabel,
  pkgLabel,
  pkgOptions,
  pkgPlaceholder,
  messageLabel,
  submitLabel,
  successMessage,
  errorMessage,
}: ContactFormProps): ReactElement {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pkg, setPkg] = useState(pkgPlaceholder);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState("submitting");
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, pkg, message }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body?.error ?? errorMessage);
        setState("error");
        return;
      }
      setName("");
      setEmail("");
      setPkg(pkgPlaceholder);
      setMessage("");
      setState("success");
    } catch {
      setError(errorMessage);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="form reveal d1" role="status">
        <p style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>
          {successMessage}
        </p>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setState("idle")}
        >
          {submitLabel}
        </button>
      </div>
    );
  }

  return (
    <form className="form reveal d1" onSubmit={onSubmit}>
      <label>
        {nameLabel}
        <input
          name="cname"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        {emailLabel}
        <input
          name="cemail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        {pkgLabel}
        <select name="cpkg" value={pkg} onChange={(e) => setPkg(e.target.value)}>
          <option value={pkgPlaceholder}>{pkgPlaceholder}</option>
          {pkgOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        {messageLabel}
        <textarea
          name="cmsg"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="btn primary"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "..." : submitLabel}{" "}
        <span className="ar">➔</span>
      </button>
      {state === "error" && error ? (
        <p role="alert" style={{ color: "var(--rose)", marginTop: "8px" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
