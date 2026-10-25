"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useState, type FormEvent } from "react";
import { InquiryFields } from "./inquiry-fields";
export function InquiryForm({ selectedRoom }: { selectedRoom?: string }) {
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
      <InquiryFields selectedRoom={selectedRoom} />
      <button className="button dark" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Send an inquiry"}{" "}
        <span>
          <ArrowIcon />
        </span>
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
