"use client";

// ─────────────────────────────────────────────────────────────
// Module 13 – Trainingshistorie & Fortschritt
//
// What this page does:
//  1. Loads all sessions for the logged-in user
//  2. Extracts the list of exercises the user has ever logged
//  3. When the user picks an exercise, fetches the progress data
//     (max weight per session) and draws a Recharts line chart
//  4. For each session the user selects, shows any trainer comments
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────

type ExerciseSummary = {
  id: string;
  name: string;
};

type ProgressPoint = {
  sessionId: string;
  date: string; // ISO string
  maxWeightKg: number;
};

type ChartPoint = {
  label: string; // formatted date for X axis
  maxWeightKg: number;
};

type TrainerComment = {
  id: string;
  text: string;
  createdAt: string;
  trainer: { id: string; name: string | null };
};

type Session = {
  id: string;
  date: string;
  plan: { name: string } | null;
  sets: Array<{
    exercise: { id: string; name: string };
    reps: number;
    weightKg: number | null;
    order: number;
  }>;
};

// ─── Main Page ────────────────────────────────────────────────

export default function HistoryPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseSummary | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [comments, setComments] = useState<TrainerComment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Route protection
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Load all sessions
  useEffect(() => {
    if (!session?.access_token) return;
    setLoadingData(true);

    fetch("http://localhost:3001/workout-sessions", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data: Session[]) => {
        setSessions(data);

        // Derive unique exercises from all sets across all sessions
        const seen = new Map<string, string>();
        data.forEach((s) =>
          s.sets.forEach((set) => {
            if (!seen.has(set.exercise.id)) {
              seen.set(set.exercise.id, set.exercise.name);
            }
          })
        );
        setExercises([...seen.entries()].map(([id, name]) => ({ id, name })));
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [session]);

  // Load progress when exercise is selected
  useEffect(() => {
    if (!selectedExercise || !session?.access_token) return;

    fetch(
      `http://localhost:3001/workout-sessions/progress/${selectedExercise.id}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    )
      .then((r) => r.json())
      .then((points: ProgressPoint[]) => {
        setChartData(
          points.map((p) => ({
            label: new Date(p.date).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            }),
            maxWeightKg: p.maxWeightKg,
          }))
        );
      })
      .catch(() => {});
  }, [selectedExercise, session]);

  // Load trainer comments when session is selected
  useEffect(() => {
    if (!selectedSession || !session?.access_token) return;

    fetch(
      `http://localhost:3001/workout-sessions/${selectedSession.id}/comments`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    )
      .then((r) => r.json())
      .then(setComments)
      .catch(() => setComments([]));
  }, [selectedSession, session]);

  if (loading || loadingData) {
    return <div style={styles.container}><p>Lade...</p></div>;
  }
  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.headerRow}>
          <h1 style={styles.heading}>📈 Trainingshistorie</h1>
          <button onClick={() => router.back()} style={styles.backButton}>
            ← Zurück
          </button>
        </div>

        {sessions.length === 0 ? (
          <p style={styles.empty}>Du hast noch kein Training aufgezeichnet.</p>
        ) : (
          <>
            {/* ── Exercise progress chart ── */}
            <section style={styles.section}>
              <h2 style={styles.subheading}>Fortschritt pro Übung</h2>

              <div style={styles.exerciseGrid}>
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExercise(ex);
                      setSelectedSession(null);
                    }}
                    style={
                      selectedExercise?.id === ex.id
                        ? { ...styles.exerciseChip, ...styles.exerciseChipActive }
                        : styles.exerciseChip
                    }
                  >
                    {ex.name}
                  </button>
                ))}
              </div>

              {selectedExercise && (
                <div style={styles.chartWrapper}>
                  {chartData.length === 0 ? (
                    <p style={styles.empty}>
                      Noch keine Daten für „{selectedExercise.name}".
                    </p>
                  ) : (
                    <>
                      <p style={styles.chartTitle}>
                        Max. Gewicht – {selectedExercise.name}
                      </p>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart
                          data={chartData}
                          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#718096" }}
                            tickLine={false}
                          />
                          <YAxis
                            unit=" kg"
                            tick={{ fontSize: 11, fill: "#718096" }}
                            tickLine={false}
                            axisLine={false}
                            width={56}
                          />
                          <Tooltip
                            formatter={(value) => [`${value} kg`, "Max. Gewicht"]}
                            contentStyle={{
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.85rem",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="maxWeightKg"
                            stroke="#3182ce"
                            strokeWidth={2.5}
                            dot={{ r: 5, fill: "#3182ce", stroke: "white", strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </div>
              )}
            </section>

            <hr style={styles.divider} />

            {/* ── Session list ── */}
            <section style={styles.section}>
              <h2 style={styles.subheading}>Alle Sessions</h2>
              <div style={styles.sessionList}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    style={
                      selectedSession?.id === s.id
                        ? { ...styles.sessionCard, ...styles.sessionCardActive }
                        : styles.sessionCard
                    }
                    onClick={() => setSelectedSession(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedSession(s)}
                  >
                    <span style={styles.sessionDate}>
                      {new Date(s.date).toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <span style={styles.sessionPlan}>
                      {s.plan?.name ?? "Ohne Plan"}
                    </span>
                    <span style={styles.sessionSets}>
                      {s.sets.length} Set{s.sets.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Session detail + trainer comments ── */}
            {selectedSession && (
              <>
                <hr style={styles.divider} />
                <section style={styles.section}>
                  <h2 style={styles.subheading}>
                    Session –{" "}
                    {new Date(selectedSession.date).toLocaleDateString("de-DE")}
                  </h2>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Übung</th>
                        <th style={styles.th}>Wdh.</th>
                        <th style={styles.th}>Gewicht</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.sets.map((set, i) => (
                        <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                          <td style={styles.td}>{set.exercise.name}</td>
                          <td style={styles.td}>{set.reps}</td>
                          <td style={styles.td}>
                            {set.weightKg != null ? `${set.weightKg} kg` : "–"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={styles.commentsBlock}>
                    <p style={styles.commentLabel}>💬 Trainer-Feedback</p>
                    {comments.length === 0 ? (
                      <p style={styles.noComments}>
                        Noch kein Feedback für diese Session.
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} style={styles.commentCard}>
                          <p style={styles.commentText}>{c.text}</p>
                          <p style={styles.commentMeta}>
                            {c.trainer.name ?? "Trainer"} ·{" "}
                            {new Date(c.createdAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif",
    padding: "2rem 1rem",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: "640px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  heading: { margin: 0, fontSize: "1.5rem" },
  backButton: {
    background: "none",
    border: "1px solid #cbd5e0",
    borderRadius: "4px",
    padding: "0.3rem 0.8rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#555",
  },
  section: { marginBottom: "1rem" },
  subheading: { fontSize: "1.1rem", margin: "0 0 0.75rem", color: "#2d3748" },
  exerciseGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  exerciseChip: {
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    border: "1px solid #cbd5e0",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#4a5568",
  },
  exerciseChipActive: {
    backgroundColor: "#3182ce",
    borderColor: "#3182ce",
    color: "white",
  },
  chartWrapper: {
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    padding: "1rem",
    border: "1px solid #e2e8f0",
  },
  chartTitle: {
    margin: "0 0 0.5rem",
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
    color: "#4a5568",
  },
  divider: { margin: "1.5rem 0", border: "none", borderTop: "1px solid #eee" },
  empty: { color: "#999", fontSize: "0.9rem", fontStyle: "italic" },
  sessionList: { display: "flex", flexDirection: "column" as const, gap: "0.4rem" },
  sessionCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "0.5rem",
    alignItems: "center",
    padding: "0.6rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  sessionCardActive: { borderColor: "#3182ce", backgroundColor: "#ebf8ff" },
  sessionDate: { fontWeight: "bold" as const, color: "#2d3748" },
  sessionPlan: { color: "#718096", fontSize: "0.85rem" },
  sessionSets: { color: "#a0aec0", fontSize: "0.8rem", textAlign: "right" as const },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  th: {
    textAlign: "left" as const,
    padding: "0.4rem 0.6rem",
    borderBottom: "2px solid #e2e8f0",
    color: "#4a5568",
    fontWeight: "bold" as const,
  },
  td: { padding: "0.4rem 0.6rem" },
  trEven: { backgroundColor: "white" },
  trOdd: { backgroundColor: "#f8fafc" },
  commentsBlock: { marginTop: "1rem" },
  commentLabel: { fontWeight: "bold" as const, color: "#4a5568", marginBottom: "0.5rem" },
  noComments: { color: "#999", fontSize: "0.85rem", fontStyle: "italic" },
  commentCard: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fbd38d",
    borderRadius: "6px",
    padding: "0.75rem",
    marginBottom: "0.5rem",
  },
  commentText: { margin: "0 0 0.4rem", color: "#2d3748", fontSize: "0.9rem" },
  commentMeta: { margin: 0, color: "#b7791f", fontSize: "0.8rem" },
} as const;
