import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
      <body>
        {/* AuthProvider wraps the entire app so every page
            can access the current user via useAuth() */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
