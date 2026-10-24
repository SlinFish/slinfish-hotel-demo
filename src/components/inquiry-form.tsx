"use client";
import { useState, type FormEvent } from "react";
import { rooms } from "@/features/rooms/catalog";
export function InquiryForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        setState("error");
        setFeedback(json.error || "Please review the form.");
        return;
      }
      setState("success");
      setFeedback(
        "Your inquiry was received. Our team would confirm availability before any reservation.",
      );
      form.reset();
    } catch {
      setState("error");
      setFeedback("Unable to connect. Please try again.");
    }
  }
  return (
    <form
      className="inquiry-form"
      onSubmit={submit}
      aria-label="Booking inquiry form"
    >
      <div className="form-grid">
        <label>
          Full name
          <input
            name="guestName"
            required
            minLength={2}
            placeholder="Your name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Arrival date
          <input name="checkIn" type="date" required />
        </label>
        <label>
          Departure date
          <input name="checkOut" type="date" required />
        </label>
        <label>
          Preferred room
          <select name="roomType" required>
            {rooms.map((r) => (
              <option value={r.id} key={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Guests
          <input
            name="guests"
            type="number"
            min="1"
            max="8"
            defaultValue="2"
            required
          />
        </label>
      </div>
      <label>
        Anything we should know?
        <textarea
          name="message"
          rows={3}
          maxLength={1200}
          placeholder="Tell us about your ideal stay..."
        />
      </label>
      <div className="hidden-field" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button dark" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Send an inquiry"} <span>↗</span>
      </button>
      <p className="form-note">
        An inquiry is not a confirmed reservation. Demo only — please do not
        submit real personal information.
      </p>
      {feedback && (
        <p role="status" className={state === "error" ? "error" : "success"}>
          {feedback}
        </p>
      )}
    </form>
  );
}
