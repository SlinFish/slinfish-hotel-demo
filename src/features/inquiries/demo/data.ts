import type { DemoInquiry } from "./model";

// Entirely invented examples. Reserved .example addresses cannot be real guest inboxes.
const seed: readonly DemoInquiry[] = [
  {
    id: "DEMO-001",
    guestName: "Mira Rowan",
    email: "mira.rowan@guest.example",
    roomType: "garden",
    checkIn: "2027-02-08",
    checkOut: "2027-02-11",
    guests: 2,
    status: "NEW",
    createdAt: "2027-01-12",
    message:
      "A quiet long weekend for two. Could you tell us about the breakfast option?",
  },
  {
    id: "DEMO-002",
    guestName: "Theo Linden",
    email: "theo.linden@guest.example",
    roomType: "terrace",
    checkIn: "2027-03-15",
    checkOut: "2027-03-19",
    guests: 2,
    status: "CONTACTED",
    createdAt: "2027-01-11",
    message:
      "We are planning a spring break and would love a terrace. We may arrive in the evening.",
  },
  {
    id: "DEMO-003",
    guestName: "Nora Vale",
    email: "nora.vale@guest.example",
    roomType: "family",
    checkIn: "2027-04-02",
    checkOut: "2027-04-07",
    guests: 4,
    status: "NEW",
    createdAt: "2027-01-10",
    message:
      "A family visit with two children. Please share more about the two sleeping areas.",
  },
  {
    id: "DEMO-004",
    guestName: "Eli Marlow",
    email: "eli.marlow@guest.example",
    roomType: "garden",
    checkIn: "2027-02-20",
    checkOut: "2027-02-22",
    guests: 1,
    status: "CLOSED",
    createdAt: "2027-01-09",
    message:
      "A short solo retreat. Travel plans have since changed; this inquiry is now closed.",
  },
  {
    id: "DEMO-005",
    guestName: "Ada Fern",
    email: "ada.fern@guest.example",
    roomType: "terrace",
    checkIn: "2027-05-10",
    checkOut: "2027-05-13",
    guests: 3,
    status: "NEW",
    createdAt: "2027-01-08",
    message:
      "Three friends looking for a few unhurried days. How is the third guest accommodated?",
  },
  {
    id: "DEMO-006",
    guestName: "Luca Wren",
    email: "luca.wren@guest.example",
    roomType: "family",
    checkIn: "2027-06-12",
    checkOut: "2027-06-18",
    guests: 4,
    status: "CONTACTED",
    createdAt: "2027-01-07",
    message:
      "Interested in a longer family stay. We would appreciate information on the garden outlook.",
  },
  {
    id: "DEMO-007",
    guestName: "Iris Ashby",
    email: "iris.ashby@guest.example",
    roomType: "garden",
    checkIn: "2027-03-01",
    checkOut: "2027-03-04",
    guests: 2,
    status: "CLOSED",
    createdAt: "2027-01-06",
    message:
      "Asked about a twin-bed arrangement. This example conversation is complete, without a confirmed booking.",
  },
];

export function createDemoInquiries(): DemoInquiry[] {
  return seed.map((record) => ({ ...record }));
}
