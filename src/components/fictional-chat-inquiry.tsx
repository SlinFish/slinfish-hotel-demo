"use client";

import { useState, type FormEvent } from "react";

export function FictionalChatInquiry() {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending" || status === "saved" || !consent || !question.trim()) return;
    setStatus("pending");
    setFeedback("");
    try {
      const response = await fetch("/api/assistant/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ question: question.trim(), consent }),
      });
      const result: { stored?: unknown; error?: unknown } = await response.json();
      if (response.status === 201 && result.stored === true) {
        setStatus("saved");
        setFeedback("Fictional inquiry saved locally. No reservation or notification was made.");
      } else {
        setStatus("error");
        setFeedback(typeof result.error === "string" ? result.error : "Inquiry not confirmed saved.");
      }
    } catch {
      setStatus("error");
      setFeedback("Unable to confirm storage. Nothing has been confirmed saved.");
    }
  }

  return (
    <div className="hospitality-inquiry">
      <button
        type="button"
        className="hospitality-inquiry-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Hide demo inquiry" : "Send fictional inquiry"}
      </button>
      {expanded && (
        <form onSubmit={submit} className="hospitality-inquiry-form" aria-label="Fictional hotel inquiry">
          <p>This is a local development demonstration. Do not enter real personal information. Chat history is not submitted.</p>
          <label>
            Demo name
            <input value="Aster Demo Guest" readOnly aria-readonly="true" />
          </label>
          <label>
            Demo contact
            <input value="aster-demo@example.invalid" readOnly aria-readonly="true" />
          </label>
          <label>
            Fictional inquiry message
            <textarea
              value={question}
              onChange={(event) => { setQuestion(event.target.value); if (status !== "saved") { setStatus("idle"); setFeedback(""); } }}
              maxLength={400}
              minLength={1}
              rows={2}
              required
              disabled={status === "pending" || status === "saved"}
              placeholder="Example: Please confirm the fictional room options for a sample weekend."
            />
          </label>
          <label className="hospitality-inquiry-consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={status === "pending" || status === "saved"}
              onChange={(event) => setConsent(event.target.checked)}
              required
            />
            I agree to save this fictional test inquiry locally for the administrator demo.
          </label>
          <button type="submit" disabled={!consent || !question.trim() || status === "pending" || status === "saved"}>
            {status === "pending" ? "Saving…" : status === "saved" ? "Saved" : "Save fictional inquiry"}
          </button>
          {feedback && <p role="status" className={status === "saved" ? "hospitality-inquiry-success" : "hospitality-inquiry-error"}>{feedback}</p>}
        </form>
      )}
    </div>
  );
}
