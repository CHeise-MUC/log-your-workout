"use client";

// This page lets the user start a new workout session.
// They pick a training plan (or start without one), and are then
// redirected to the active session page where they log their sets.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type TrainingPlan = { id: string; name: string };

export default function StartWorkoutPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Load the user's training plans for the dropdown
  useEffect(() => {
    if (!session?.access_token) return;
    fetch("http://localhost:3001/training-plans", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => setError("Pläne konnten nicht geladen werden."));
  }, [session]);

  async function handleStart() {
    if (!session?.access_token) return;
    setStarting(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/workout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanId || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newSession = await res.json();

      // Redirect to the active session page with the new session ID
      router.push(`/dashboard/workout/${newSession.id}`);
    } catch {
      setError("Session konnte nicht gestartet werden.");
      setStarting(false);
    }
  }

  if (loading || !user) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => router.push("/dashboard")} style={styles.backLink}>
          ← Dashboard
        </button>
        <h1 style={styles.heading}>Training starten</h1>

        <div style={styles.field}>
          <label style={styles.label}>Trainingsplan (optional)</label>
          <select
            style={styles.select}
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
          >
            <option value="">Ohne Plan (freies Training)</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <p style={styles.hint}>
            Mit Plan siehst du die Übungen und Zielvorgaben direkt während des Trainings.
          </p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleStart} style={styles.startButton} disabled={starting}>
          {starting ? "Wird gestartet..." : "🏋️ Training starten"}
        </button>

        <button
          onClick={() => router.push("/dashboard/workout/history")}
          style={styles.historyButton}
        >
          Trainingshistorie anzeigen →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif", padding: "2rem",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: "white", padding: "2rem", borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "100%", maxWidth: "480px",
  },
  backLink: {
    background: "none", border: "none", color: "#666", cursor: "pointer",
    fontSize: "0.9rem", padding: "0", marginBottom: "1rem", display: "block",
  },
  heading: { margin: "0 0 1.5rem", fontSize: "1.5rem" },
  field: { marginBottom: "1.5rem" },
  label: { display: "block", fontWeight: "bold" as const, marginBottom: "0.4rem" },
  select: {
    width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #ddd",
    borderRadius: "4px", fontSize: "1rem",
  },
  hint: { margin: "0.4rem 0 0", fontSize: "0.8rem", color: "#888" },
  error: { color: "#e53e3e", fontSize: "0.9rem", marginBottom: "1rem" },
  startButton: {
    width: "100%", padding: "0.9rem", backgroundColor: "#38a169", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer",
    fontSize: "1.1rem", fontWeight: "bold" as const, marginBottom: "0.75rem",
  },
  historyButton: {
    width: "100%", padding: "0.7rem", backgroundColor: "transparent",
    color: "#3182ce", border: "1px solid #3182ce", borderRadius: "4px",
    cursor: "pointer", fontSize: "0.95rem",
  },
} as const;
