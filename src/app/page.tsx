import { HotelHome } from "@/features/hotel/home";
import { rooms } from "@/features/rooms/catalog";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const requested = (await searchParams).room;
  const selectedRoom = rooms.find((room) => room.id === requested)?.id;
  return <HotelHome selectedRoom={selectedRoom} />;
}
