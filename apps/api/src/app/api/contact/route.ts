import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { getEmailSettings, sendEmail } from "~/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  email: z.string().trim().email("Enter a valid email.").max(200),
  pkg: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
  locale: z.enum(["id", "en"]).optional(),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c] ?? c);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function allowedOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
  return raw
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function withCors(request: Request, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins().includes(origin.replace(/\/$/, ""))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }
  return response;
}

export async function OPTIONS(request: Request): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "900");
  return withCors(request, response);
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return withCors(
      request,
      NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      ),
    );
  }

  const { name, email, pkg, message, locale = "id" } = parsed.data;

  let submission: { id: string };
  try {
    submission = await prisma.contactSubmission.create({
      data: { name, email, pkg: pkg ?? null, message, locale },
    });
  } catch (err) {
    console.error("contact route — db create failed", err);
    return withCors(
      request,
      NextResponse.json(
        {
          error:
            "Could not save submission. Run DB migrations (contact_submissions table missing?).",
        },
        { status: 500 },
      ),
    );
  }

  const emailSettings = await getEmailSettings();
  if (emailSettings.enabled && emailSettings.notifyTo && emailSettings.fromEmail) {
    try {
      if (!emailSettings.resendApiKeyConfigured) {
        throw new Error("Resend API key is not configured.");
      }
      const safeName = escapeHtml(name);
      const safeEmail = escapeAttribute(email);
      const safePkg = pkg ? escapeHtml(pkg) : "—";
      const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
      await sendEmail({
        to: emailSettings.notifyTo,
        subject: `New contact submission — ${name}`,
        html: `
          <p>New inquiry coming for forkumi</p>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Plan of interest:</strong> ${safePkg}</p>
          <p><strong>Locale:</strong> ${locale}</p>
          <hr/>
          <p>${safeMessage}</p>
        `.trim(),
        text: [
          `New inquiry coming for forkumi`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Plan: ${pkg ?? "—"}`,
          `Locale: ${locale}`,
          "",
          message,
        ].join("\n"),
      });
    } catch (err) {
      console.error("contact route — email notify failed", err);
      // Still return success for the form save; email is best-effort.
    }
  }

  return withCors(
    request,
    NextResponse.json({ success: true, id: submission.id }, { status: 201 }),
  );
}
