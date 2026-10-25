"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/features/inquiries/ui/status-badge";
type Item = {
  id: string;
  guestName: string;
  email: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "NEW" | "CONTACTED" | "CLOSED";
  message?: string;
  createdAt: string;
};
export default function Staff() {
  const [token, setToken] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/inquiries", {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      if (!res.ok)
        throw new Error(
          res.status === 401
            ? "Invalid staff access token"
            : "Unable to load inquiries",
        );
      setItems((await res.json()).inquiries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }
  async function update(id: string, status: Item["status"]) {
    try {
      const res = await fetch("/api/staff/inquiries", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Could not update");
      await load();
    } catch {
      setError("Status update failed");
    }
  }
  return (
    <main id="main-content" className="staff-page">
      <div className="staff-top">
        <div>
          <span className="eyebrow">THE ASTER HOUSE / OPERATIONS</span>
          <h1>Inquiry dashboard</h1>
          <p>Protected workspace. Authorized staff access is required.</p>
        </div>
        <div className="staff-nav">
          <Link href="/">← Back to site</Link>
          <Link href="/staff/demo">
            Explore the public demo <ArrowIcon />
          </Link>
        </div>
      </div>
      <section className="staff-login">
        <label>
          Staff access token{" "}
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            placeholder="Enter your staff access token"
          />
        </label>
        <button
          className="button dark"
          onClick={load}
          disabled={!token || loading}
        >
          {loading ? "Loading…" : "Load inquiries"}
        </button>
      </section>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="staff-cards">
        {items.map((item) => (
          <article className="staff-card" key={item.id}>
            <div className="staff-card-top">
              <strong>{item.guestName}</strong>
              <StatusBadge status={item.status} />
            </div>
            <p>{item.email}</p>
            <p>
              {item.roomType} · {item.guests} guest(s)
            </p>
            <p>
              {item.checkIn.slice(0, 10)} → {item.checkOut.slice(0, 10)}
            </p>
            {item.message && <p className="message">{item.message}</p>}
            <label>
              Status{" "}
              <select
                value={item.status}
                onChange={(e) =>
                  update(item.id, e.target.value as Item["status"])
                }
              >
                <option>NEW</option>
                <option>CONTACTED</option>
                <option>CLOSED</option>
              </select>
            </label>
          </article>
        ))}
      </div>
      {!loading && !error && items.length === 0 && (
        <p className="muted">
          Enter the staff token to load inquiries. No sample guest records are
          preloaded.
        </p>
      )}
    </main>
  );
}
