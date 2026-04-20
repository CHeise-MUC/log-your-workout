"use client";

// This page lets the user start a new workout session.
// They pick a training plan (or start without one), and are then
// redirected to the active session page where they log their sets.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type TrainingPlan = {
  id: string;
  name: string;
  description: string | null;
  _count: { planExercises: number };
};

export default function StartWorkoutPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Load the user's training plans
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
          planId: selectedPlanId ?? undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newSession = await res.json();
      router.push(`/dashboard/workout/${newSession.id}`);
    } catch {
      setError("Session konnte nicht gestartet werden.");
      setStarting(false);
    }
  }

  if (loading || !user) return <div style={styles.container}><p>Loading...</p></div>;

  const canStart = selectedPlanId !== undefined; // null = no plan selected yet, "" = free training

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => router.back()} style={styles.backLink}>
          ← Zurück
        </button>
        <h1 style={styles.heading}>Training starten</h1>

        {/* Free training option */}
        <p style={styles.sectionLabel}>Trainingsplan wählen</p>
        <div
          style={
            selectedPlanId === ""
              ? { ...styles.planCard, ...styles.planCardSelected }
              : styles.planCard
          }
          onClick={() => setSelectedPlanId("")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setSelectedPlanId("")}
        >
          <span style={styles.planName}>🏃 Freies Training</span>
          <span style={styles.planMeta}>Ohne Plan – Übungen frei wählbar</span>
        </div>

        {/* Plan cards */}
        {plans.map((plan) => {
          const isEmpty = plan._count.planExercises === 0;
          const isSelected = selectedPlanId === plan.id;

          return (
            <div key={plan.id} style={isEmpty ? styles.planCardEmpty : isSelected ? { ...styles.planCard, ...styles.planCardSelected } : styles.planCard}>
              <div style={styles.planCardTop}>
                <div>
                  <span style={isEmpty ? styles.planNameDisabled : styles.planName}>
                    {plan.name}
                  </span>
                  {isEmpty ? (
                    <span style={styles.emptyBadge}>Keine Übungen</span>
                  ) : (
                    <span style={styles.countBadge}>
                      {plan._count.planExercises} Übung{plan._count.planExercises !== 1 ? "en" : ""}
                    </span>
                  )}
                </div>

                {/* Only selectable if plan has exercises */}
                {!isEmpty && (
                  <button
                    style={isSelected ? styles.selectBtnActive : styles.selectBtn}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {isSelected ? "✓ Gewählt" : "Wählen"}
                  </button>
                )}
              </div>

              {plan.description && (
                <span style={isEmpty ? styles.planMetaDisabled : styles.planMeta}>
                  {plan.description}
                </span>
              )}

              {/* CTA for empty plans */}
              {isEmpty && (
                <button
                  style={styles.editLink}
                  onClick={() => router.push(`/dashboard/training-plans/${plan.id}`)}
                >
                  ✏️ Übungen hinzufügen
                </button>
              )}
            </div>
          );
        })}

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleStart}
          style={selectedPlanId === null ? styles.startButtonDisabled : styles.startButton}
          disabled={starting || selectedPlanId === null}
        >
          {starting ? "Wird gestartet..." : "🏋️ Training starten"}
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
  heading: { margin: "0 0 1.25rem", fontSize: "1.5rem" },
  sectionLabel: { fontWeight: "bold" as const, fontSize: "0.85rem", color: "#718096", marginBottom: "0.5rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" },

  // Normal selectable plan card
  planCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.9rem 1rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.2rem",
  },
  planCardSelected: {
    border: "2px solid #38a169",
    backgroundColor: "#f0fff4",
  },
  // Empty (disabled) plan card – not clickable to start
  planCardEmpty: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.9rem 1rem",
    marginBottom: "0.5rem",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
    opacity: 0.8,
  },
  planCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: { fontWeight: "bold" as const, color: "#2d3748", marginRight: "0.5rem" },
  planNameDisabled: { fontWeight: "bold" as const, color: "#a0aec0", marginRight: "0.5rem" },
  planMeta: { fontSize: "0.85rem", color: "#718096", display: "block" },
  planMetaDisabled: { fontSize: "0.85rem", color: "#cbd5e0", display: "block" },

  countBadge: {
    fontSize: "0.75rem", color: "#38a169",
    backgroundColor: "#f0fff4", border: "1px solid #9ae6b4",
    borderRadius: "999px", padding: "0.1rem 0.5rem",
  },
  emptyBadge: {
    fontSize: "0.75rem", color: "#e53e3e",
    backgroundColor: "#fff5f5", border: "1px solid #feb2b2",
    borderRadius: "999px", padding: "0.1rem 0.5rem",
  },

  selectBtn: {
    fontSize: "0.8rem", padding: "0.25rem 0.7rem",
    border: "1px solid #cbd5e0", borderRadius: "4px",
    backgroundColor: "white", cursor: "pointer", color: "#4a5568",
    flexShrink: 0,
  },
  selectBtnActive: {
    fontSize: "0.8rem", padding: "0.25rem 0.7rem",
    border: "1px solid #38a169", borderRadius: "4px",
    backgroundColor: "#38a169", cursor: "pointer", color: "white",
    flexShrink: 0,
  },

  editLink: {
    background: "none", border: "none", cursor: "pointer",
    color: "#3182ce", fontSize: "0.85rem", padding: "0",
    textAlign: "left" as const, textDecoration: "underline",
  },

  error: { color: "#e53e3e", fontSize: "0.9rem", margin: "0.75rem 0" },

  startButton: {
    marginTop: "1rem",
    width: "100%", padding: "0.9rem", backgroundColor: "#38a169", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer",
    fontSize: "1.1rem", fontWeight: "bold" as const,
  },
  startButtonDisabled: {
    marginTop: "1rem",
    width: "100%", padding: "0.9rem", backgroundColor: "#c6f6d5", color: "#9ae6b4",
    border: "none", borderRadius: "4px", cursor: "not-allowed",
    fontSize: "1.1rem", fontWeight: "bold" as const,
  },
} as const;
