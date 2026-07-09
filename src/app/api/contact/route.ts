import { NextResponse } from "next/server";
import { Resend } from "resend";

// Where leads are delivered, and the address they're sent from. Both are
// overridable via env so the sender can move to a verified berqut.com domain
// later without a code change. `onboarding@resend.dev` works on Resend's free
// tier with no domain verification, so the form is functional immediately.
//
// TEMPORARY (demo state): Resend's shared `onboarding@resend.dev` sender can
// only deliver to the Resend account owner's own address until a domain is
// verified. We don't have DNS access to berqut.com yet, so the Vercel
// production env currently sets CONTACT_TO_EMAIL to the account owner's
// personal email so the form is fully functional for the demo. Once the
// client grants DNS access: verify berqut.com in Resend, set
// CONTACT_FROM_EMAIL to a berqut.com address, remove the CONTACT_TO_EMAIL
// override in Vercel (or set it to "Roberts@berqut.com") so it falls back to
// the default below, and redeploy.
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "Roberts@berqut.com";
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "BERQUT Website <onboarding@resend.dev>";

const CLIENT_TYPES = new Set(["investor", "family", "entrepreneur", ""]);

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  clientType?: unknown;
  message?: unknown;
  // Honeypot — real users never fill this; bots often do.
  company?: unknown;
  locale?: unknown;
};

function asString(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Silently accept honeypot hits so bots get a 200 and don't retry, but never
  // send an email.
  if (asString(body.company, 100) !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name, 100);
  const email = asString(body.email, 200);
  const phone = asString(body.phone, 40);
  const message = asString(body.message, 5000);
  const clientTypeRaw = asString(body.clientType, 40);
  const clientType = CLIENT_TYPES.has(clientTypeRaw) ? clientTypeRaw : "";
  const locale = asString(body.locale, 10);

  // Minimum viable lead: a name, a valid email, and a message.
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "required";
  if (!email) fieldErrors.email = "required";
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "invalid";
  if (!message) fieldErrors.message = "required";

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "validation", fieldErrors },
      { status: 400 }
    );
  }

  // If the key isn't set (e.g. before the Resend account is wired up), fail
  // clearly instead of throwing — the UI shows its error state.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  const subject = `New enquiry — ${name}${clientType ? ` (${clientType})` : ""}`;
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    clientType ? `Client type: ${clientType}` : null,
    locale ? `Site language: ${locale}` : null,
    "",
    "Message:",
    message,
  ].filter((l) => l !== null);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
      <h2 style="color:#8a6d3b">New enquiry from berqut.com</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      ${clientType ? `<p><strong>Client type:</strong> ${escapeHtml(clientType)}</p>` : ""}
      ${locale ? `<p><strong>Site language:</strong> ${escapeHtml(locale)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-line">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email, // replies go straight to the lead
      subject,
      text: lines.join("\n"),
      html,
    });

    if (error) {
      console.error("Contact form: Resend error", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form: unexpected error", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
