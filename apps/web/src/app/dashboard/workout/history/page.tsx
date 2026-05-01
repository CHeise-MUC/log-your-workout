"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type LoggedSet = {
  id: string;
  order: number;
  reps: number;
  weightKg: number | null;
  exercise: { name: string };
};

type WorkoutSession = {
  id: string;
  date: string;
  plan: { name: string } | null;
  sets: LoggedSet[];
};

export default function WorkoutHistoryPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/v1/workout-sessions", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [session]);

  if (loading || !user) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backLink}>
            ← Zurück
          </button>
          <h1 style={styles.heading}>Trainingshistorie</h1>
        </div>

        <button
          onClick={() => router.push("/dashboard/workout")}
          style={styles.newSessionButton}
        >
          🏋️ Neues Training starten
        </button>

        {fetching ? (
          <p>Lädt...</p>
        ) : sessions.length === 0 ? (
          <div style={styles.card}>
            <p style={styles.empty}>Noch keine Trainingseinheiten aufgezeichnet.</p>
          </div>
        ) : (
          sessions.map((s) => {
            const isExpanded = expandedId === s.id;
            // Group sets by exercise name for display
            const byExercise = s.sets.reduce<Record<string, LoggedSet[]>>((acc, set) => {
              const key = set.exercise.name;
              if (!acc[key]) acc[key] = [];
              acc[key].push(set);
              return acc;
            }, {});

            return (
              <div key={s.id} style={styles.card}>
                <div
                  style={styles.sessionHeader}
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  role="button"
                >
                  <div>
                    <div style={styles.sessionTitle}>
                      {s.plan ? s.plan.name : "Freies Training"}
                    </div>
                    <div style={styles.sessionDate}>
                      {new Date(s.date).toLocaleDateString("de-DE", {
                        weekday: "long", day: "numeric",
                        month: "long", year: "numeric",
                      })}
                    </div>
                  </div>
                  <div style={styles.sessionMeta}>
                    <span style={styles.setCount}>{s.sets.length} Sätze</span>
                    <span style={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.sessionDetails}>
                    <hr style={styles.divider} />
                    {Object.entries(byExercise).map(([exerciseName, sets]) => (
                      <div key={exerciseName} style={styles.exerciseBlock}>
                        <div style={styles.exerciseName}>{exerciseName}</div>
                        {sets.map((set) => (
                          <div key={set.id} style={styles.setRow}>
                            <span style={styles.setOrder}>Satz {set.order}</span>
                            <span>
                              {set.reps} Wdh.
                              {set.weightKg != null
                                ? ` × ${set.weightKg} kg`
                                : " (Körpergewicht)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <button
                      style={styles.continueButton}
                      onClick={() => router.push(`/dashboard/workout/${s.id}`)}
                    >
                      Session wieder öffnen →
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "sans-serif", padding: "2rem" },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.9rem", padding: "0", marginBottom: "0.5rem", display: "block" },
  heading: { margin: "0", fontSize: "1.8rem" },
  newSessionButton: { width: "100%", padding: "0.8rem", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" as const, marginBottom: "1.5rem" },
  card: { backgroundColor: "white", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1rem" },
  sessionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  sessionTitle: { fontWeight: "bold" as const, fontSize: "1.05rem" },
  sessionDate: { color: "#666", fontSize: "0.85rem", marginTop: "0.2rem" },
  sessionMeta: { display: "flex", alignItems: "center", gap: "0.75rem" },
  setCount: { backgroundColor: "#ebf8ff", color: "#2b6cb0", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" as const },
  chevron: { color: "#999", fontSize: "0.8rem" },
  sessionDetails: { marginTop: "0.75rem" },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "0.75rem 0" },
  exerciseBlock: { marginBottom: "0.75rem" },
  exerciseName: { fontWeight: "bold" as const, fontSize: "0.9rem", marginBottom: "0.3rem", color: "#444" },
  setRow: { display: "flex", gap: "1rem", fontSize: "0.85rem", padding: "0.25rem 0.5rem", backgroundColor: "#f0fff4", borderRadius: "4px", marginBottom: "0.2rem" },
  setOrder: { color: "#276749", fontWeight: "bold" as const, minWidth: "60px" },
  continueButton: { marginTop: "0.75rem", padding: "0.5rem 1rem", backgroundColor: "transparent", color: "#3182ce", border: "1px solid #3182ce", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" },
  empty: { color: "#888", fontStyle: "italic" as const },
} as const;
