import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Log your Workout",
  description: "Track your training sessions, sets, reps, and weights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
