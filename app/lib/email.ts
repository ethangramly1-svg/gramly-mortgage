import { Resend } from "resend";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, NMLS } from "./contact";

/**
 * Email plumbing.
 *
 * Two transactional emails fire on every contact submission:
 *   1. Admin notification → CONTACT_EMAIL (i.e. Chris). Plain, scannable.
 *   2. Customer confirmation → the lead's email. Branded, editorial.
 *
 * Both are best-effort. The /api/contact route never fails on email
 * errors — the lead is already in Turso. Failures are logged to the
 * Vercel function logs so they're recoverable.
 *
 * The `from` address uses Resend's onboarding@resend.dev test sender
 * by default. In test mode that only sends to addresses registered
 * on the Resend account (so admin notifications work; customer
 * confirmations bounce until you verify a sending domain). To switch
 * to a real domain after verification:
 *   1. Add the domain in Resend dashboard → Domains → Verify
 *   2. Set FROM_ADDRESS in .env.local + Vercel env to something like
 *      "Chris Gramly <chris@clearmtg.com>"
 */

const FROM_ADDRESS = process.env.FROM_ADDRESS || "Chris Gramly <onboarding@resend.dev>";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_...")) {
    console.warn("[email] RESEND_API_KEY not set — emails will be skipped");
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

export type LeadEmailPayload = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  source: "home" | "contact" | "dossier";
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function adminHtml(p: LeadEmailPayload): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0b06;color:#ece3cc;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#181108;border:1px solid rgba(212,180,106,0.22);">
        <tr><td style="padding:32px 32px 8px;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;">
            New lead · ${esc(p.source)}
          </div>
          <h1 style="margin:12px 0 0;font-size:32px;font-weight:300;letter-spacing:-0.02em;line-height:1.1;color:#ece3cc;">
            ${esc(p.name)}
          </h1>
          <div style="margin-top:6px;font-size:14px;color:rgba(236,227,204,0.55);">
            via ${esc(p.source)} · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC
          </div>
        </td></tr>

        <tr><td style="padding:0 32px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#967135,#d4b46a,#967135,transparent);margin:20px 0;"></div>
        </td></tr>

        <tr><td style="padding:0 32px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="120" style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.45);padding:8px 0;">Email</td>
              <td style="font-size:15px;color:#ece3cc;padding:8px 0;"><a href="mailto:${esc(p.email)}" style="color:#d4b46a;text-decoration:none;">${esc(p.email)}</a></td>
            </tr>
            ${
              p.phone
                ? `<tr>
                <td style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.45);padding:8px 0;">Phone</td>
                <td style="font-size:15px;color:#ece3cc;padding:8px 0;"><a href="tel:${esc(p.phone)}" style="color:#d4b46a;text-decoration:none;">${esc(p.phone)}</a></td>
              </tr>`
                : ""
            }
            ${
              p.service
                ? `<tr>
                <td style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.45);padding:8px 0;">Program</td>
                <td style="font-size:15px;color:#ece3cc;padding:8px 0;text-transform:capitalize;">${esc(p.service)}</td>
              </tr>`
                : ""
            }
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px 8px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.45);">Message</div>
          <p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:rgba(236,227,204,0.85);white-space:pre-wrap;">${esc(p.message)}</p>
        </td></tr>

        <tr><td style="padding:24px 32px 32px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard/submissions?id=${esc(p.id)}"
             style="display:inline-block;padding:14px 28px;border:1px solid #d4b46a;color:#d4b46a;font-family:monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">
            Open in dashboard →
          </a>
        </td></tr>

        <tr><td style="padding:0 32px 24px;">
          <div style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.35);border-top:1px solid rgba(212,180,106,0.22);padding-top:16px;">
            id ${esc(p.id)} · auto-notification
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function customerHtml(p: LeadEmailPayload): string {
  const programLabel = p.service ? p.service.replace(/^[a-z]/, (c) => c.toUpperCase()) : "your loan";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0b06;color:#ece3cc;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#181108;border:1px solid rgba(212,180,106,0.22);">
        <tr><td style="padding:40px 40px 8px;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;">
            § Received
          </div>
          <h1 style="margin:20px 0 0;font-size:36px;font-weight:300;letter-spacing:-0.03em;line-height:1.05;color:#ece3cc;font-family:Georgia,serif;">
            Thank you,<br>
            <span style="color:rgba(236,227,204,0.55);">${esc(p.name.split(" ")[0])}.</span>
          </h1>
        </td></tr>

        <tr><td style="padding:0 40px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#967135,#d4b46a,#967135,transparent);margin:28px 0;"></div>
        </td></tr>

        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:rgba(236,227,204,0.85);">
            Your note about <strong style="color:#d4b46a;font-weight:500;">${esc(programLabel)}</strong> reached the desk. I&rsquo;ll review it personally and reply within 24 hours &mdash; usually faster.
          </p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:rgba(236,227,204,0.85);">
            No automated follow-up sequences. No call without a reply first. Just a real conversation when the timing is right.
          </p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:rgba(236,227,204,0.85);">
            If something is time-sensitive, ${esc(CONTACT_PHONE_DISPLAY)} reaches me directly.
          </p>
        </td></tr>

        <tr><td style="padding:32px 40px 40px;">
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:300;letter-spacing:-0.02em;color:#ece3cc;">Chris Gramly</div>
          <div style="margin-top:4px;font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.45);">
            Clear Modern Mortgage · NMLS ${NMLS}
          </div>
        </td></tr>

        <tr><td style="padding:0 40px 32px;">
          <div style="font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(236,227,204,0.35);border-top:1px solid rgba(212,180,106,0.22);padding-top:16px;">
            <a href="mailto:${esc(CONTACT_EMAIL)}" style="color:rgba(236,227,204,0.55);text-decoration:none;">${esc(CONTACT_EMAIL)}</a>
            &nbsp;·&nbsp;
            <a href="tel:${esc(CONTACT_PHONE_DISPLAY)}" style="color:rgba(236,227,204,0.55);text-decoration:none;">${esc(CONTACT_PHONE_DISPLAY)}</a>
            &nbsp;·&nbsp;
            Las Vegas
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendLeadNotification(p: LeadEmailPayload) {
  const r = getResend();
  if (!r) return { skipped: true };
  try {
    const result = await r.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_EMAIL,
      replyTo: p.email,
      subject: `New lead · ${p.name}${p.service ? ` · ${p.service}` : ""}`,
      html: adminHtml(p),
    });
    if (result.error) console.error("[email/admin] resend error:", result.error);
    return result;
  } catch (e) {
    console.error("[email/admin] send threw:", e);
    return { error: e };
  }
}

export async function sendLeadConfirmation(p: LeadEmailPayload) {
  const r = getResend();
  if (!r) return { skipped: true };
  try {
    const result = await r.emails.send({
      from: FROM_ADDRESS,
      to: p.email,
      replyTo: CONTACT_EMAIL,
      subject: "Thank you — Chris Gramly",
      html: customerHtml(p),
    });
    if (result.error) console.error("[email/customer] resend error:", result.error);
    return result;
  } catch (e) {
    console.error("[email/customer] send threw:", e);
    return { error: e };
  }
}
