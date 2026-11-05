"use client";

import { useRef, useState, type FormEvent } from "react";

type InquiryResponse = { stored?: unknown; inquiryId?: unknown; message?: unknown };
export function HospitalityInquiryForm({ mode, onBack }: {
  mode: "connected" | "preview";
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || saved || !consent || !name.trim() || !contact.trim() || !question.trim()) return;
    setFeedback("");
    if (mode === "preview") {
      setFeedback("Offline simulation only. No inquiry was transmitted, saved, or sent to staff.");
      return;
    }
    sending.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/assistant/inquiry", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, question, consent: true }),
      });
      const result: InquiryResponse = await response.json();
      if (response.status === 201 && result.stored === true && typeof result.inquiryId === "string") {
        setSaved(true);
        setFeedback("Fictional inquiry saved locally for administrator review. No notification or reservation was made.");
      } else if (response.ok && result.stored === false) {
        setFeedback("Inquiry validated but not saved. Local storage is not configured; nothing was sent.");
      } else {
        setFeedback("The fictional inquiry was not confirmed saved. Please check the local assistant.");
      }
    } catch {
      setFeedback("Unable to confirm whether the inquiry was saved. Check the administrator dashboard before retrying to avoid duplicates.");
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  if (saved) {
    return (
      <div className="hospitality-inquiry hospitality-inquiry-complete" role="status">
        <div className="hospitality-inquiry-success-icon" aria-hidden="true">✓</div>
        <h3>Inquiry saved</h3>
        <p>Fictional inquiry saved locally for administrator review.</p>
        <p>No staff notification was sent and no reservation was made.</p>
        <button type="button" className="hospitality-inquiry-submit" onClick={onBack}>
          Back to chat
        </button>
      </div>
    );
  }

  return (
    <div className="hospitality-inquiry">
      <div className="hospitality-inquiry-toolbar">
        <button type="button" onClick={onBack}>← Back to chat</button>
        <strong>Leave a fictional inquiry</strong>
      </div>
      <p className="hospitality-inquiry-note">
        This is a development demonstration. Use invented names and reserved example contact details only.
        Do not enter real personal data. Submitting is optional and does not make a reservation.
      </p>
      <form onSubmit={submit} className="hospitality-inquiry-form">
        <label htmlFor="hospitality-inquiry-name">Fictional name
          <input id="hospitality-inquiry-name" required maxLength={100} value={name}
            onChange={(event) => setName(event.target.value)} placeholder="Example Guest" disabled={pending || saved} />
        </label>
        <label htmlFor="hospitality-inquiry-contact">Fictional contact
          <input id="hospitality-inquiry-contact" required maxLength={150} value={contact}
            onChange={(event) => setContact(event.target.value)} placeholder="guest@example.invalid" disabled={pending || saved} />
        </label>
        <label htmlFor="hospitality-inquiry-question">Inquiry message
          <textarea id="hospitality-inquiry-question" required maxLength={400} rows={3} value={question}
            onChange={(event) => setQuestion(event.target.value)} placeholder="I would like to ask about a fictional stay." disabled={pending || saved} />
        </label>
        <label className="hospitality-inquiry-consent">
          <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={pending || saved} />
          <span>I agree to submit this fictional inquiry for the local demonstration.</span>
        </label>
        <button className="hospitality-inquiry-submit" disabled={pending || saved || !consent} type="submit">
          {saved ? "Saved locally" : pending ? "Submitting…" : mode === "preview" ? "Preview inquiry" : "Submit fictional inquiry"}
        </button>
      </form>
      {feedback && <p role="status" className="hospitality-inquiry-feedback">{feedback}</p>}
    </div>
  );
}
