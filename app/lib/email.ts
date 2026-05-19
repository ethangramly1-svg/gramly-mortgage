import { Resend } from "resend";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_RAW,
} from "./contact";

/**
 * Email plumbing.
 *
 * Two transactional emails fire on every contact submission:
 *   1. Admin notification → ADMIN_EMAILS. Plain, scannable, with a
 *      mailto: "Reply to lead" CTA so the admin can answer from
 *      their own inbox.
 *   2. Customer confirmation → the lead's email. Branded, editorial,
 *      summarises what they submitted and sets a 24-hour expectation.
 *
 * Both are best-effort. The /api/contact route fires them
 * without awaiting, so the form returns immediately. Errors are
 * caught inside each function and logged — they never surface to
 * the customer.
 *
 * The `from` address defaults to Resend's onboarding@resend.dev
 * test sender. In test mode that only delivers to the address
 * registered on the Resend account; to ship production:
 *   1. Add a domain in Resend dashboard → Domains → Verify
 *   2. Set FROM_ADDRESS in .env.local + Vercel env to something
 *      like "Chris Gramly <chris@clearmtg.com>".
 */

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============ CONFIG (edit per client) ============
const FROM         = process.env.FROM_ADDRESS || "Chris Gramly <onboarding@resend.dev>";
const ADMIN_EMAILS: string[] = [CONTACT_EMAIL];
const REPLY_TO     = CONTACT_EMAIL;
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "https://gramly-mortgage.com";
const BRAND        = "Clear Modern Mortgage";
const PHONE        = CONTACT_PHONE_DISPLAY;
const PHONE_RAW    = CONTACT_PHONE_RAW;
// ==================================================

export type SubmissionPayload = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  source: "home" | "contact" | "dossier";
  created_at: string;
};

export async function sendAdminNotification(s: SubmissionPayload) {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAILS,
      replyTo: s.email,
      subject: `New lead — ${s.name} · ${s.service ?? "General"}`,
      html: adminTemplate(s),
    });
  } catch (err) {
    console.error("[email:admin]", err);
  }
}

export async function sendCustomerConfirmation(s: SubmissionPayload) {
  try {
    await resend.emails.send({
      from: FROM,
      to: [s.email],
      replyTo: REPLY_TO,
      subject: `${BRAND} — we've received your message`,
      html: customerTemplate(s),
    });
  } catch (err) {
    console.error("[email:customer]", err);
  }
}

// ----- templates below -----

function adminTemplate(s: SubmissionPayload) {
  const subject = `Re: your enquiry — ${BRAND}`;
  const replyBody = `Hi ${s.name},\r\n\r\nThanks for getting in touch with ${BRAND}.\r\n\r\n`;
  const replyHref = `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyBody)}`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0f0b06;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ece3cc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;">
      <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr><td style="padding:0 32px 24px;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4b46a;">${BRAND} · new lead</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,#d4b46a,transparent);margin:14px 0;"></div>
          </td></tr>

          <tr><td style="padding:0 32px;">
            <h1 style="margin:0 0 8px;font-weight:300;font-size:32px;line-height:1.1;letter-spacing:-0.02em;color:#ece3cc;">${escapeHtml(s.name)}</h1>
            <p style="margin:0;color:rgba(236,227,204,0.6);font-size:15px;">
              ${escapeHtml(s.service ?? "General enquiry")} · from <span style="color:#d4b46a;">${escapeHtml(s.source)}</span> page
            </p>
          </td></tr>

          <tr><td style="padding:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#181108;border:1px solid rgba(212,180,106,0.18);">
              <tr><td style="padding:24px;">
                ${row("Email", `<a href="mailto:${s.email}" style="color:#d4b46a;text-decoration:none;">${escapeHtml(s.email)}</a>`)}
                ${s.phone ? row("Phone", `<a href="tel:${s.phone}" style="color:#d4b46a;text-decoration:none;">${escapeHtml(s.phone)}</a>`) : ""}
                ${row("Service", escapeHtml(s.service ?? "—"))}
                ${row("Source", escapeHtml(s.source))}
                ${row("Received", new Date(s.created_at).toLocaleString())}
              </td></tr>
            </table>
          </td></tr>

          ${s.message ? `
          <tr><td style="padding:0 32px 32px;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:12px;">§ Message</div>
            <div style="font-size:16px;line-height:1.7;color:rgba(236,227,204,0.85);font-weight:300;white-space:pre-wrap;">${escapeHtml(s.message)}</div>
          </td></tr>` : ""}

          <tr><td style="padding:0 32px 40px;" align="center">
            <a href="${replyHref}" style="display:inline-block;padding:14px 28px;border:1px solid #d4b46a;color:#d4b46a;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Reply to ${escapeHtml(s.name)} →</a>
          </td></tr>

          <tr><td style="padding:32px;border-top:1px solid rgba(212,180,106,0.12);text-align:center;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.35);">
              ${BRAND} · admin notification · <a href="${SITE_URL}/dashboard/submissions?id=${s.id}" style="color:rgba(236,227,204,0.55);text-decoration:none;">open in dashboard →</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function customerTemplate(s: SubmissionPayload) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0f0b06;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ece3cc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b06;">
      <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr><td style="padding:0 32px 24px;" align="center">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4b46a;">${BRAND}</div>
            <div style="height:1px;background:linear-gradient(90deg,transparent,#d4b46a,transparent);margin:14px auto;width:80px;"></div>
          </td></tr>

          <tr><td style="padding:0 32px 24px;" align="center">
            <div style="display:inline-block;padding:8px 18px;border:1px solid rgba(212,180,106,0.4);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;">
              § Message received
            </div>
          </td></tr>

          <tr><td style="padding:0 32px 16px;" align="center">
            <h1 style="margin:0;font-weight:200;font-size:40px;line-height:1.05;letter-spacing:-0.03em;color:#ece3cc;">
              Thank you,<br /><span style="color:#d4b46a;">${escapeHtml(firstName(s.name))}.</span>
            </h1>
          </td></tr>

          <tr><td style="padding:8px 32px 32px;" align="center">
            <p style="margin:0;color:rgba(236,227,204,0.65);font-size:17px;line-height:1.6;font-weight:300;max-width:420px;">
              We&rsquo;ve received your message and our team will be in touch within 24 hours.
            </p>
          </td></tr>

          <tr><td style="padding:0 32px 32px;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:14px;">§ What happens next</div>
            <ol style="margin:0;padding-left:18px;color:rgba(236,227,204,0.8);font-size:15px;line-height:1.8;font-weight:300;">
              <li>We&rsquo;ll review your enquiry and prepare a reply tailored to ${escapeHtml(s.service ?? "your interest")}.</li>
              <li>You&rsquo;ll hear back from us by email — usually within a few hours.</li>
              <li>If we need to set up a call, we&rsquo;ll suggest a few times that work for us.</li>
            </ol>
          </td></tr>

          <tr><td style="padding:0 32px 32px;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#d4b46a;margin-bottom:14px;">§ Your request</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#181108;border:1px solid rgba(212,180,106,0.18);">
              <tr><td style="padding:22px;">
                ${row("Name",    escapeHtml(s.name))}
                ${row("Email",   escapeHtml(s.email))}
                ${s.phone   ? row("Phone",   escapeHtml(s.phone))   : ""}
                ${row("Service", escapeHtml(s.service ?? "—"))}
                ${s.message ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(212,180,106,0.12);font-size:14px;color:rgba(236,227,204,0.7);line-height:1.7;white-space:pre-wrap;">${escapeHtml(s.message)}</div>` : ""}
              </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:0 32px 32px;" align="center">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(236,227,204,0.5);margin-bottom:14px;">§ Need to reach us sooner?</div>
            <div style="margin-bottom:8px;">
              <a href="tel:${PHONE_RAW}" style="display:inline-block;margin:4px;padding:12px 22px;border:1px solid #d4b46a;color:#d4b46a;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Call ${escapeHtml(PHONE)}</a>
              <a href="mailto:${REPLY_TO}" style="display:inline-block;margin:4px;padding:12px 22px;border:1px solid rgba(212,180,106,0.3);color:rgba(236,227,204,0.65);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">Email us →</a>
            </div>
          </td></tr>

          <tr><td style="padding:32px;border-top:1px solid rgba(212,180,106,0.12);text-align:center;">
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.35);">
              <a href="${SITE_URL}" style="color:rgba(236,227,204,0.55);text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
            </div>
            <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(236,227,204,0.25);margin-top:10px;">
              © ${new Date().getFullYear()} · ${BRAND}
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(236,227,204,0.4);width:90px;vertical-align:top;padding-top:3px;">${label}</td>
        <td style="font-size:15px;color:#ece3cc;">${value}</td>
      </tr>
    </table>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function firstName(s: string) {
  return s.trim().split(/\s+/)[0] || s;
}
