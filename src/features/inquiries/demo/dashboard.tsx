"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { useState } from "react";
import { rooms } from "@/features/rooms/catalog";
import { StatusBadge, statusLabels } from "../ui/status-badge";
import { createDemoInquiries } from "./data";
import {
  changeDemoStatus,
  demoStatuses,
  filterDemoInquiries,
  summarizeDemoInquiries,
  type StatusFilter,
} from "./model";

const roomName = (id: string) =>
  rooms.find((room) => room.id === id)?.name ?? id;
const date = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

export function DemoDashboard() {
  const [records, setRecords] = useState(createDemoInquiries);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState("DEMO-001");
  const [announcement, setAnnouncement] = useState("");
  const visible = filterDemoInquiries(records, query, filter);
  const selected =
    visible.find((record) => record.id === selectedId) ?? visible[0];
  const counts = summarizeDemoInquiries(records);

  function reset() {
    setRecords(createDemoInquiries());
    setQuery("");
    setFilter("ALL");
    setSelectedId("DEMO-001");
    setAnnouncement("Demo reset. All fictional inquiries restored.");
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/" className="dashboard-brand">
          <span aria-hidden="true">✳</span> THE ASTER HOUSE
          <small>HOSPITALITY WORKSPACE</small>
        </Link>
        <nav aria-label="Demo workspace">
          <a
            href="#demo-inquiries"
            className="workspace-link"
            aria-current="page"
          >
            <span aria-hidden="true">▤</span> Inquiries{" "}
            <span>{records.length}</span>
          </a>
          <Link href="/">← Hotel website</Link>
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">BUILT BY SLINFISH</span>
          <p>A thoughtful guest experience, from first hello.</p>
          <Link href="/staff">
            Protected staff access <ArrowIcon />
          </Link>
        </div>
      </aside>
      <main id="main-content" className="dashboard-main">
        <div className="dashboard-topline">
          <span>Workspace / Inquiries</span>
          <span className="demo-pill">● DEMO MODE</span>
        </div>
        <header className="dashboard-heading">
          <div>
            <span className="eyebrow">A WARM WELCOME STARTS HERE</span>
            <h1>
              Guest inquiries<span className="gold">.</span>
            </h1>
            <p>A little attention. A memorable first impression.</p>
          </div>
          <button className="button outline" onClick={reset}>
            Reset demo <span aria-hidden="true">↺</span>
          </button>
        </header>
        <div className="demo-notice">
          <span aria-hidden="true">ⓘ</span>
          <p>
            <strong>A safe space to explore.</strong> All records are fictional.
            Status changes are simulated in this page only and reset on reload.
            No messages are sent and no database records are changed.
          </p>
        </div>
        <section className="summary-grid" aria-label="Inquiry summary">
          {(
            [
              ["total", "Total inquiries"],
              ["NEW", "New inquiries"],
              ["CONTACTED", "Contacted"],
              ["CLOSED", "Closed"],
            ] as const
          ).map(([key, label], index) => (
            <article className="summary-card" key={key}>
              <span>{label}</span>
              <strong>{counts[key]}</strong>
              <small>
                {index === 0
                  ? "Fictional guest conversations"
                  : index === 1
                    ? "Ready for a first hello"
                    : index === 2
                      ? "Conversations in progress"
                      : "Example conversations complete"}
              </small>
            </article>
          ))}
        </section>
        <section
          id="demo-inquiries"
          className="inquiry-workspace"
          aria-labelledby="inquiries-heading"
        >
          <div className="workspace-toolbar">
            <div>
              <h2 id="inquiries-heading">The inquiry desk</h2>
              <p>Explore a conversation, then try changing its status.</p>
            </div>
            <div className="workspace-filters">
              <label>
                Search inquiries
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, email, room or reference"
                />
              </label>
              <label>
                Status
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as StatusFilter)
                  }
                >
                  <option value="ALL">All statuses</option>
                  {demoStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <p className="result-count" role="status">
            {visible.length} of {records.length} inquiries
          </p>
          <div className="workspace-grid">
            <div className="inquiry-list">
              {visible.length ? (
                <ul aria-label="Fictional inquiries">
                  {visible.map((record) => (
                    <li key={record.id}>
                      <button
                        className={`inquiry-row ${selected?.id === record.id ? "selected" : ""}`}
                        onClick={() => setSelectedId(record.id)}
                        aria-pressed={selected?.id === record.id}
                        aria-controls="inquiry-detail"
                      >
                        <span className="guest-avatar" aria-hidden="true">
                          {record.guestName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <span className="guest-summary">
                          <strong>{record.guestName}</strong>
                          <small>
                            {roomName(record.roomType)} · {record.guests} guests
                          </small>
                          <small>{date(record.checkIn)}</small>
                        </span>
                        <StatusBadge status={record.status} />
                        <span className="row-arrow" aria-hidden="true">
                          <ArrowIcon />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <span aria-hidden="true">⌕</span>
                  <h3>No matching inquiries</h3>
                  <p>Try another name or choose a different status.</p>
                  <button
                    className="button outline"
                    onClick={() => {
                      setQuery("");
                      setFilter("ALL");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            <section
              id="inquiry-detail"
              className="inquiry-detail"
              aria-labelledby="detail-heading"
            >
              {selected ? (
                <>
                  <div className="detail-top">
                    <span className="eyebrow">
                      {selected.id} · FICTIONAL RECORD
                    </span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <h3 id="detail-heading">{selected.guestName}</h3>
                  <p className="detail-email">{selected.email}</p>
                  <dl className="detail-facts">
                    <div>
                      <dt>Room preference</dt>
                      <dd>{roomName(selected.roomType)}</dd>
                    </div>
                    <div>
                      <dt>Guests</dt>
                      <dd>{selected.guests} guests</dd>
                    </div>
                    <div>
                      <dt>Arrival</dt>
                      <dd>{date(selected.checkIn)}</dd>
                    </div>
                    <div>
                      <dt>Departure</dt>
                      <dd>{date(selected.checkOut)}</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>{date(selected.createdAt)}</dd>
                    </div>
                  </dl>
                  <div className="guest-message">
                    <h4>A note from the guest</h4>
                    <p>“{selected.message}”</p>
                  </div>
                  <label className="status-control">
                    Inquiry status
                    <select
                      value={selected.status}
                      onChange={(event) => {
                        const status = event.target
                          .value as typeof selected.status;
                        setRecords((current) =>
                          changeDemoStatus(current, selected.id, status),
                        );
                        setAnnouncement(
                          `${selected.guestName}: status changed to ${statusLabels[status]}. Simulated only.`,
                        );
                      }}
                    >
                      {demoStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="form-note">
                    Simulated change · resets on reload · no reservation
                    confirmed
                  </p>
                </>
              ) : (
                <>
                  <h3 id="detail-heading">No inquiry selected</h3>
                  <p>Clear your filters to explore the fictional records.</p>
                </>
              )}
            </section>
          </div>
        </section>
        <p className="dashboard-announcement" role="status" aria-live="polite">
          {announcement}
        </p>
        <div className="dashboard-footer">
          <span>THE ASTER HOUSE · FICTIONAL HOTEL DEMO</span>
          <span>Thoughtfully built by SlinFish Software</span>
        </div>
      </main>
    </div>
  );
}
