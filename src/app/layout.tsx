import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "The Aster House | Boutique Stay Demo",
  description:
    "A boutique hotel booking-inquiry demonstration by SlinFish Software.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
