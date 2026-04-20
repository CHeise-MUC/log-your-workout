"use client";

// Client progress page – visible only to the client's trainer.
// Shows all workout sessions with sets, weights, and reps.

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type LoggedSet = {
  id: string;
  order: number;
  reps: number;
  weightKg: number | null;
  exercise: { name: string };
};

type Session = {
  id: string;
  date: string;
  plan: { name: string } | null;
  sets: LoggedSet[];
};

export default function ClientProgressPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    fetch(`http://localhost:3001/trainer/clients/${clientId}/progress`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Fortschritt konnte nicht geladen werden.");
        return r.json();
      })
      .then((data) => {
        setSessions(data);
        setFetching(false);
      })
      .catch((err) => {
        setError(err.message);
        setFetching(false);
      });
  }, [session, clientId]);

  if (loading || fetching) return <div style={s.page}><p>Lädt...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <button onClick={() => router.back()} style={s.backLink}>← Zurück</button>
          <h1 style={s.heading}>Kunden-Fortschritt</h1>
          <p style={s.subtitle}>{sessions.length} Trainingseinheiten aufgezeichnet</p>
        </div>

        {error && <p style={s.error}>{error}</p>}

        {sessions.length === 0 && !error ? (
          <div style={s.card}><p style={s.empty}>Dieser Kunde hat noch keine Sessions aufgezeichnet.</p></div>
        ) : (
          sessions.map((sess) => {
            const isExpanded = expandedId === sess.id;
            const byExercise = sess.sets.reduce<Record<string, LoggedSet[]>>((acc, set) => {
              const key = set.exercise.name;
              if (!acc[key]) acc[key] = [];
              acc[key].push(set);
              return acc;
            }, {});

            return (
              <div key={sess.id} style={s.card}>
                <div
                  style={s.sessionHeader}
                  onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                  role="button"
                >
                  <div>
                    <div style={s.sessionTitle}>{sess.plan?.name ?? "Freies Training"}</div>
                    <div style={s.sessionDate}>
                      {new Date(sess.date).toLocaleDateString("de-DE", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>
                  </div>
                  <div style={s.meta}>
                    <span style={s.badge}>{sess.sets.length} Sätze</span>
                    <span style={s.chevron}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <hr style={s.divider} />
                    {Object.entries(byExercise).map(([name, sets]) => (
                      <div key={name} style={{ marginBottom: "0.75rem" }}>
                        <div style={s.exerciseName}>{name}</div>
                        {sets.map((set) => (
                          <div key={set.id} style={s.setRow}>
                            <span style={s.setOrder}>Satz {set.order}</span>
                            <span>
                              {set.reps} Wdh.
                              {set.weightKg != null ? ` × ${set.weightKg} kg` : " (Körpergewicht)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
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

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "sans-serif", padding: "2rem" },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.9rem", padding: 0, marginBottom: "0.5rem", display: "block" },
  heading: { margin: "0 0 0.25rem", fontSize: "1.8rem" },
  subtitle: { margin: 0, color: "#666", fontSize: "0.9rem" },
  card: { backgroundColor: "white", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1rem" },
  sessionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  sessionTitle: { fontWeight: "bold" as const, fontSize: "1.05rem" },
  sessionDate: { color: "#666", fontSize: "0.85rem", marginTop: "0.2rem" },
  meta: { display: "flex", alignItems: "center", gap: "0.75rem" },
  badge: { backgroundColor: "#ebf8ff", color: "#2b6cb0", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" as const },
  chevron: { color: "#999", fontSize: "0.8rem" },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "0.75rem 0" },
  exerciseName: { fontWeight: "bold" as const, fontSize: "0.9rem", marginBottom: "0.3rem", color: "#444" },
  setRow: { display: "flex", gap: "1rem", fontSize: "0.85rem", padding: "0.25rem 0.5rem", backgroundColor: "#f0fff4", borderRadius: "4px", marginBottom: "0.2rem" },
  setOrder: { color: "#276749", fontWeight: "bold" as const, minWidth: "60px" },
  error: { color: "#e53e3e", fontSize: "0.9rem" },
  empty: { color: "#888", fontStyle: "italic" as const },
} as const;
