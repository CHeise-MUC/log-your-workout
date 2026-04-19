"use client";

// This is a protected page. Only logged-in users can see it.
// If someone visits /dashboard without being logged in,
// they get redirected to /auth/login automatically.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type DbProfile = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "TRAINER";
};

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<DbProfile | null>(null);

  // Trainers can switch between their trainer view and the user view locally.
  // This does NOT change the role in the database – the account stays TRAINER.
  const [viewAsUser, setViewAsUser] = useState(false);

  // Route protection
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Load the user's database profile (includes role)
  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/users/me", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {});
  }, [session]);

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;
  if (!user) return null;

  const displayName = user.user_metadata?.name ?? user.email ?? "Unknown User";
  const isTrainerAccount = profile?.role === "TRAINER";

  // Effective view mode: trainer accounts can switch to user view locally
  const isTrainerView = isTrainerAccount && !viewAsUser;

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

        {/* Role badge + view toggle (only visible for trainer accounts) */}
        {profile && (
          <div style={styles.roleRow}>
            <span style={isTrainerView ? styles.badgeTrainer : styles.badgeUser}>
              {isTrainerView ? "🎓 Trainer-Ansicht" : "👤 Nutzer-Ansicht"}
            </span>
            {isTrainerAccount && (
              <button
                onClick={() => setViewAsUser((v) => !v)}
                style={styles.roleToggle}
              >
                {isTrainerView ? "Zur Nutzer-Ansicht" : "Zur Trainer-Ansicht"}
              </button>
            )}
          </div>
        )}

        <hr style={styles.divider} />

        {/* Navigation – buttons shown depend on the effective view mode */}
        <p style={styles.label}>Features</p>
        <button onClick={() => router.push("/dashboard/exercises")} style={styles.navButton}>
          💪 Übungen verwalten
        </button>
        <button onClick={() => router.push("/dashboard/training-plans")} style={styles.navButton}>
          📋 Trainingspläne
        </button>

        {/* User features – visible to regular users and trainers in user view */}
        {!isTrainerView && (
          <>
            <button onClick={() => router.push("/dashboard/workout")} style={styles.navButton}>
              🏋️ Training starten
            </button>
            <button onClick={() => router.push("/dashboard/assigned-plans")} style={styles.navButton}>
              📨 Vom Trainer zugewiesene Pläne
            </button>
          </>
        )}

        {/* Trainer features – only visible in trainer view */}
        {isTrainerView && (
          <button onClick={() => router.push("/trainer")} style={styles.trainerButton}>
            🎓 Kunden & Pläne verwalten
          </button>
        )}

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
// ApiStatus: verifies backend connectivity
// ─────────────────────────────────────────────
function ApiStatus({ session }: { session: Session | null }) {
  const [status, setStatus] = useState<string>("Connecting...");

  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/profile", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStatus(`✅ Backend antwortet: ${JSON.stringify(data)}`))
      .catch((err) => setStatus(`⚠️ Backend nicht erreichbar (${err.message}) – läuft die API?`));
  }, [session]);

  return (
    <div>
      <p style={styles.label}>Backend-Verbindung:</p>
      <p style={styles.apiStatus}>{status}</p>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", fontFamily: "sans-serif" },
  card: { backgroundColor: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "100%", maxWidth: "480px" },
  heading: { margin: "0 0 0.5rem", fontSize: "1.5rem" },
  welcome: { fontSize: "1.1rem", margin: "0.5rem 0" },
  email: { color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0.75rem" },
  roleRow: { display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" },
  roleToggle: { fontSize: "0.8rem", padding: "0.2rem 0.6rem", backgroundColor: "transparent", border: "1px solid #cbd5e0", borderRadius: "4px", cursor: "pointer", color: "#555" },
  badgeUser: { backgroundColor: "#e2e8f0", color: "#4a5568", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" as const },
  badgeTrainer: { backgroundColor: "#fefcbf", color: "#744210", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" as const },
  divider: { margin: "1.5rem 0", border: "none", borderTop: "1px solid #eee" },
  label: { fontWeight: "bold" as const, marginBottom: "0.5rem", display: "block" },
  apiStatus: { fontSize: "0.9rem", color: "#444" },
  navButton: { padding: "0.6rem 1.2rem", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", marginBottom: "0.5rem", display: "block", width: "100%", textAlign: "left" as const },
  trainerButton: { padding: "0.6rem 1.2rem", backgroundColor: "#d69e2e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", marginBottom: "0.5rem", display: "block", width: "100%", textAlign: "left" as const },
  logoutButton: { padding: "0.6rem 1.2rem", backgroundColor: "#e53e3e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" },
} as const;
