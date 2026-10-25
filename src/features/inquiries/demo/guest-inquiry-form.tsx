"use client";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowIcon } from "@/components/arrow-icon";
import { InquiryFields } from "@/components/inquiry-fields";
import { rooms } from "@/features/rooms/catalog";
import { simulateGuestInquiry } from "./guest-inquiry";
function Simulation({ selectedRoom }: { selectedRoom?: string }) {
  const [feedback, setFeedback] = useState<ReturnType<
    typeof simulateGuestInquiry
  > | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(
      simulateGuestInquiry(
        Object.fromEntries(new FormData(event.currentTarget).entries()),
      ),
    );
  }
  return (
    <form
      className="inquiry-form"
      onSubmit={submit}
      aria-label="Booking inquiry form"
      aria-describedby="demo-inquiry-note"
    >
      <InquiryFields selectedRoom={selectedRoom} sampleOnly />
      <button className="button dark" type="submit">
        Preview inquiry <ArrowIcon />
      </button>
      <p className="form-note" id="demo-inquiry-note">
        Interactive demo · sample contact details only. Nothing is sent or
        stored.
      </p>
      {feedback && (
        <p role="status" className={feedback.ok ? "success" : "error"}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}
function SelectedSimulation({ fallbackRoom }: { fallbackRoom?: string }) {
  const query = useSearchParams();
  const selectedRoom = rooms.find(
    (room) => room.id === (query.get("room") ?? fallbackRoom),
  )?.id;
  return (
    <Simulation key={selectedRoom ?? rooms[0].id} selectedRoom={selectedRoom} />
  );
}
// Replaces only the operational form module in the allowlisted static build.
export function InquiryForm({ selectedRoom }: { selectedRoom?: string }) {
  return (
    <Suspense
      fallback={<p role="status">Preparing the interactive inquiry preview…</p>}
    >
      <SelectedSimulation fallbackRoom={selectedRoom} />
    </Suspense>
  );
}
