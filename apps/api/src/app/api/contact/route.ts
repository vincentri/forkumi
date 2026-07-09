import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "~/lib/db";
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

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { name, email, pkg, message, locale = "id" } = parsed.data;

  const submission = await prisma.contactSubmission.create({
    data: { name, email, pkg: pkg ?? null, message, locale },
  });

  const emailSettings = await getEmailSettings();
  if (emailSettings.enabled && emailSettings.notifyTo && emailSettings.fromEmail) {
    try {
      const safeName = escapeHtml(name);
      const safeEmail = escapeAttribute(email);
      const safePkg = pkg ? escapeHtml(pkg) : "—";
      const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
      await sendEmail({
        to: emailSettings.notifyTo,
        subject: `New contact submission — ${name}`,
        html: `
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Plan of interest:</strong> ${safePkg}</p>
          <p><strong>Locale:</strong> ${locale}</p>
          <hr/>
          <p>${safeMessage}</p>
        `.trim(),
        text: [
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
    }
  }

  return NextResponse.json({ success: true, id: submission.id }, { status: 201 });
}
