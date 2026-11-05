"use client";

import { useState } from "react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
type LeadSource = "CHAT_FORM" | "HOTEL_FORM" | "OTHER";
type Stay = { roomType: string | null; checkIn: string | null; checkOut: string | null; guests: number | null } | null;
type Lead = {
  id: string; name: string; contact: string; question: string;
  source: LeadSource; status: LeadStatus; version: number;
  createdAt: string; hotelStay: Stay;
};
type Event = {
  id: string; previousStatus: LeadStatus; nextStatus: LeadStatus;
  version: number; actorId: string; createdAt: string;
};
type Detail = Lead & { statusEvents: Event[] };
const transitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["CONTACTED", "WON", "LOST"],
  WON: ["QUALIFIED"],
  LOST: ["CONTACTED"],
};
const sourceNames: Record<LeadSource, string> = {
  CHAT_FORM: "AI chat", HOTEL_FORM: "Hotel form", OTHER: "Other",
};

export function LeadManagementPanel({ token }: { token: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Invalid staff token"
          : typeof payload.error === "string" ? payload.error : "Request failed",
      );
    }
    return payload;
  }

  async function loadLeads(id = selectedId) {
    if (!token) { setError("Enter a staff token first"); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const payload = await request("/api/staff/leads", { headers: authHeaders() });
      const rows = payload.inquiries as Lead[];
      setLeads(rows);
      setLoaded(true);
      if (id && rows.some((lead) => lead.id === id)) {
        const result = await request(`/api/staff/leads?id=${encodeURIComponent(id)}`, { headers: authHeaders() });
        setDetail(result.inquiry as Detail);
        setSelectedId(id);
      } else {
        setSelectedId(null); setDetail(null);
      }
    } catch (err) {
      setLoaded(false); setLeads([]); setDetail(null); setSelectedId(null);
      setError(err instanceof Error ? err.message : "Unable to load AI inquiries");
    } finally { setBusy(false); }
  }

  async function selectLead(id: string) {
    if (!token) return;
    setBusy(true); setError("");
    try {
      const payload = await request(`/api/staff/leads?id=${encodeURIComponent(id)}`, { headers: authHeaders() });
      setDetail(payload.inquiry as Detail);
      setSelectedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load details");
    } finally { setBusy(false); }
  }

  async function updateStatus(status: LeadStatus) {
    if (!detail || !token) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await request("/api/staff/leads", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.id, status, version: detail.version }),
      });
      setNotice("Status updated and recorded in history.");
      await loadLeads(detail.id);
      setNotice("Status updated and recorded in history.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update inquiry");
      // On conflict, keep the old version displayed and require an explicit refresh.
    } finally { setBusy(false); }
  }

  const visible = leads.filter((lead) => {
    const q = filter.trim().toLowerCase();
    return !q || [lead.name, lead.contact, lead.question, lead.source, lead.status].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <section aria-labelledby="ai-inquiries-title" style={{ marginTop: "2rem" }}>
      <div className="staff-top">
        <div>
          <span className="eyebrow">NEW LEAD WORKFLOW</span>
          <h2 id="ai-inquiries-title">AI & general inquiries</h2>
          <p>Business-scoped inquiries with recorded status history. This is separate from legacy bookings.</p>
        </div>
        <button className="button dark" type="button" onClick={() => loadLeads()} disabled={busy || !token}>
          {busy ? "Working…" : loaded ? "Refresh AI inquiries" : "Load AI inquiries"}
        </button>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {loaded && (
        <>
          <label>
            Search AI inquiries{" "}
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Name, contact, question, status" />
          </label>
          <p className="muted">{visible.length} of {leads.length} inquiries</p>
          <div className="staff-cards">
            {visible.map((lead) => (
              <article className="staff-card" key={lead.id}>
                <div className="staff-card-top">
                  <strong>{lead.name}</strong>
                  <span>{lead.status}</span>
                </div>
                <p>{lead.contact}</p>
                <p>{sourceNames[lead.source]} · {new Date(lead.createdAt).toLocaleDateString()}</p>
                <p className="message">{lead.question}</p>
                <button type="button" className="button outline" disabled={busy} onClick={() => selectLead(lead.id)}>
                  {selectedId === lead.id ? "Reload details & history" : "View details & history"}
                </button>
              </article>
            ))}
          </div>
          {visible.length === 0 && <p className="muted">No matching AI inquiries.</p>}
          {detail && (
            <section className="staff-card" aria-labelledby="lead-detail-title" style={{ marginTop: "1rem" }}>
              <h3 id="lead-detail-title">{detail.name} — inquiry details</h3>
              <p><strong>Contact:</strong> {detail.contact}</p>
              <p><strong>Source:</strong> {sourceNames[detail.source]}</p>
              <p><strong>Question:</strong> {detail.question}</p>
              <p><strong>Current status:</strong> {detail.status} (version {detail.version})</p>
              {detail.hotelStay && (
                <p>
                  <strong>Stay details:</strong> {detail.hotelStay.roomType || "No room preference"}
                  {" · "}{detail.hotelStay.guests ?? "?"} guest(s)
                  {" · "}{detail.hotelStay.checkIn?.slice(0, 10) ?? "No arrival date"}
                  {" → "}{detail.hotelStay.checkOut?.slice(0, 10) ?? "No departure date"}
                </p>
              )}
              <label>
                Update status{" "}
                <select value="" disabled={busy || transitions[detail.status].length === 0} onChange={(e) => {
                  if (e.target.value) void updateStatus(e.target.value as LeadStatus);
                }}>
                  <option value="">Choose next status</option>
                  {transitions[detail.status].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <h4>Status history</h4>
              {detail.statusEvents.length ? (
                <ol>
                  {detail.statusEvents.map((event) => (
                    <li key={event.id}>
                      {event.previousStatus} → {event.nextStatus} · {new Date(event.createdAt).toLocaleString()} · {event.actorId}
                    </li>
                  ))}
                </ol>
              ) : <p className="muted">No status changes recorded yet.</p>}
            </section>
          )}
        </>
      )}
    </section>
  );
}
