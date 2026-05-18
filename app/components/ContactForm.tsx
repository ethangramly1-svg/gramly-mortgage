"use client";

import { useState } from "react";

/**
 * Form used by both the home-page <Correspondence /> section and the
 * dedicated /contact page. Currently logs to console; phase 09 wires
 * the real /api/contact endpoint (Resend + Turso).
 */
export default function ContactForm({ source = "contact" }: { source?: "home" | "contact" }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const data = Object.fromEntries(new FormData(form));
      // Phase 09 wires the real /api/contact endpoint. For now:
      console.log("[contact submission]", { ...data, source });
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="frame p-8 md:p-12">
        <span className="frame-tr" />
        <span className="frame-bl" />
        <div className="eyebrow mb-3">§ Received</div>
        <h3 className="font-display font-light text-2xl md:text-3xl tracking-[-0.03em]">
          Thank you.
          <br />
          <span className="text-bone/55">We&apos;ll be in touch shortly.</span>
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid grid-cols-2 gap-6">
        <input name="name" required placeholder="Name" className="input-field" />
        <input name="email" type="email" required placeholder="Email" className="input-field" />
      </div>
      <input name="phone" placeholder="Phone (optional)" className="input-field" />
      <select name="service" defaultValue="" required className="input-field">
        <option value="" disabled>Which program fits?</option>
        <option value="jumbo">Jumbo purchase</option>
        <option value="conventional">Conventional purchase</option>
        <option value="refinance">Refinance</option>
        <option value="investment">Investment property</option>
        <option value="government">First-time / Government-backed</option>
        <option value="other">Not sure yet</option>
      </select>
      <textarea
        name="message"
        required
        placeholder="Message"
        rows={5}
        className="input-field resize-none"
      />

      <div className="flex items-center justify-between pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send →"}
        </button>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-bone/35">
          Replies typically within 24 hours
        </span>
      </div>
    </form>
  );
}
