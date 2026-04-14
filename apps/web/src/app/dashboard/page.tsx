"use client";

// This is a protected page. Only logged-in users can see it.
// If someone visits /dashboard without being logged in,
// they get redirected to /auth/login automatically.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  // Route Protection:
  // After auth state is known (loading = false), check if a user exists.
  // If not, send them to the login page.
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // While we're still checking auth state, show a loading screen.
  // This prevents a flash of the dashboard before the redirect happens.
  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  // If there's no user (and the redirect is in progress), render nothing.
  if (!user) {
    return null;
  }

  // The user is logged in — show the dashboard.
  const displayName =
    user.user_metadata?.name ?? user.email ?? "Unknown User";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Dashboard</h1>
        <p style={styles.welcome}>
          Willkommen zurück, <strong>{displayName}</strong>!
        </p>
        <p style={styles.email}>Eingeloggt als: {user.email}</p>

        <hr style={styles.divider} />

        {/* Navigation to features */}
        <p style={styles.label}>Features</p>
        <button onClick={() => router.push("/dashboard/exercises")} style={styles.navButton}>
          💪 Übungen verwalten
        </button>
        <button onClick={() => router.push("/dashboard/training-plans")} style={styles.navButton}>
          📋 Trainingspläne
        </button>

        <hr style={styles.divider} />

        <ApiStatus session={session} />

        <hr style={styles.divider} />

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ApiStatus: Makes a real call to our NestJS backend.
// It sends the JWT token in the Authorization header.
// The backend's AuthGuard checks the token and responds.
// ─────────────────────────────────────────────
import type { Session } from "@supabase/supabase-js";

function ApiStatus({ session }: { session: Session | null }) {
  const [status, setStatus] = useState<string>("Connecting...");

  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/profile", {
      headers: {
        // The JWT token is sent here. The backend's AuthGuard reads this.
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStatus(`✅ Backend antwortet: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        setStatus(`⚠️ Backend nicht erreichbar (${err.message}) – läuft die API?`);
      });
  }, [session]);

  return (
    <div>
      <p style={styles.label}>Backend-Verbindung:</p>
      <p style={styles.apiStatus}>{status}</p>
    </div>
  );
}

// useState needs to be imported separately because ApiStatus uses it too.
// We import it here at the top-level to keep things clean.
import { useState } from "react";

// ─────────────────────────────────────────────
// Inline styles — we'll replace these with proper
// CSS/Tailwind in a later module when we design the UI.
// ─────────────────────────────────────────────
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "480px",
  },
  heading: {
    margin: "0 0 0.5rem",
    fontSize: "1.5rem",
  },
  welcome: {
    fontSize: "1.1rem",
    margin: "0.5rem 0",
  },
  email: {
    color: "#666",
    fontSize: "0.9rem",
    margin: "0.25rem 0",
  },
  divider: {
    margin: "1.5rem 0",
    border: "none",
    borderTop: "1px solid #eee",
  },
  label: {
    fontWeight: "bold" as const,
    marginBottom: "0.25rem",
  },
  apiStatus: {
    fontSize: "0.9rem",
    color: "#444",
  },
  navButton: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "0.5rem",
    display: "block",
    width: "100%",
    textAlign: "left" as const,
  },
  logoutButton: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
} as const;
