import type { Metadata } from "next";
import { DemoDashboard } from "@/features/inquiries/demo/dashboard";
export const metadata: Metadata = {
  title: "Guest Inquiry Workspace | The Aster House Demo",
  description:
    "Explore a fictional hotel inquiry dashboard. All changes are simulated and reset on reload.",
};
export default function PublicStaffDemo() {
  return <DemoDashboard />;
}
