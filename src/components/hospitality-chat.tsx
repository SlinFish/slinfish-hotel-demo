"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Mode = "connected" | "preview";
type Entry = { role: "guest" | "assistant"; text: string };
type Reply = {
  message?: unknown;
  handoff?: unknown;
};
const welcome = "Welcome to The Aster House. Ask about our fictional hotel. No reservations are made here.";
const unavailable = "The local assistant is unavailable. Please try again later.";
const preview = "This is an offline chat preview. No message was sent to an AI service. Connect the local AI Assistant to test live conversations.";
const maxLength = 1000;

export function HospitalityChat({ mode = "connected" }: { mode?: Mode }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([{ role: "assistant", text: welcome }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const context = useRef<{ handle: string; sequence: number } | null>(null);
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [entries, open]);

  useEffect(() => () => {
    generation.current++;
    pending.current?.abort();
  }, []);

  function reset() {
    generation.current++;
    pending.current?.abort();
    pending.current = null;
    context.current = null;
    setBusy(false);
    setDraft("");
    setEntries([{ role: "assistant", text: welcome }]);
    // The server's short-lived topic will expire; no customer history is persisted.
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || message.length > maxLength || busy) return;
    const requestGeneration = generation.current;
    setEntries((current) => [...current, { role: "guest", text: message }]);
    setDraft("");
    if (mode === "preview") {
      setEntries((current) => [...current, { role: "assistant", text: preview }]);
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    pending.current = controller;
    const oldContext = context.current;
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Chat-Context": oldContext?.handle ?? "new",
          ...(oldContext ? { "X-Chat-Sequence": String(oldContext.sequence + 1) } : {}),
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });
      const result: Reply = await response.json();
      if (requestGeneration !== generation.current || controller.signal.aborted) return;
      const nextHandle = response.headers.get("X-Chat-Context");
      const nextSequence = Number(response.headers.get("X-Chat-Sequence"));
      context.current = response.ok && nextHandle && Number.isSafeInteger(nextSequence) && nextSequence > 0
        ? { handle: nextHandle, sequence: nextSequence }
        : null;
      setEntries((current) => [...current, {
        role: "assistant",
        text: response.ok && typeof result.message === "string" ? result.message : unavailable,
      }]);
    } catch {
      if (requestGeneration !== generation.current || controller.signal.aborted) return;
      context.current = null;
      setEntries((current) => [...current, { role: "assistant", text: unavailable }]);
    } finally {
      if (requestGeneration === generation.current) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <aside className="hospitality-chat" aria-label="Aster House chat assistant">
      {open && (
        <section className="hospitality-chat-panel" aria-label="Hotel assistant conversation">
          <div className="hospitality-chat-heading">
            <div>
              <strong>Aster House Assistant</strong>
              <small>{mode === "preview" ? "Offline simulation · fictional hotel" : "Local AI Assistant · fictional hotel"}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>
          <div className="hospitality-chat-history" role="log" aria-live="polite" aria-relevant="additions text">
            {entries.map((entry, index) => (
              <p key={index} className={entry.role === "guest" ? "hospitality-chat-guest" : "hospitality-chat-assistant"}>
                {entry.text}
              </p>
            ))}
            {busy && <p className="hospitality-chat-assistant">Checking approved hotel information…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit} className="hospitality-chat-composer">
            <label htmlFor="hospitality-chat-input" className="sr-only">Your hotel question</label>
            <input
              id="hospitality-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={maxLength}
              placeholder="Ask about the hotel…"
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" disabled={!draft.trim() || busy}>Send</button>
          </form>
          <div className="hospitality-chat-footer">
            <span>No booking or staff notification is made.</span>
            <button type="button" onClick={reset}>Reset chat</button>
          </div>
        </section>
      )}
      <button
        type="button"
        className="hospitality-chat-launcher"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Close chat" : "Ask the hotel assistant"}
      </button>
    </aside>
  );
}
