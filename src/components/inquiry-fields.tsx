import { rooms } from "@/features/rooms/catalog";
export function InquiryFields({
  selectedRoom,
  sampleOnly = false,
}: {
  selectedRoom?: string;
  sampleOnly?: boolean;
}) {
  return (
    <>
      <div className="form-grid">
        <label>
          Full name
          <input
            name="guestName"
            autoComplete={sampleOnly ? "off" : "name"}
            readOnly={sampleOnly}
            defaultValue={sampleOnly ? "Sample Guest" : undefined}
            maxLength={100}
            required
            minLength={2}
            placeholder="Your name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            autoComplete={sampleOnly ? "off" : "email"}
            readOnly={sampleOnly}
            defaultValue={sampleOnly ? "guest@example.com" : undefined}
            maxLength={254}
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
          <select
            name="roomType"
            required
            defaultValue={selectedRoom ?? rooms[0].id}
          >
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
          readOnly={sampleOnly}
          defaultValue={sampleOnly ? "A quiet weekend getaway." : undefined}
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
    </>
  );
}
