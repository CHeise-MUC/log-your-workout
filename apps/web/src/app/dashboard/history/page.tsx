"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { apiUrl } from "@/lib/api";

type ExerciseSummary = { id: string; name: string };
type ProgressPoint = { sessionId: string; date: string; maxWeightKg: number };
type ChartPoint = { label: string; maxWeightKg: number };
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

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoadingData(true);
    fetch(apiUrl("/workout-sessions"), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data: Session[]) => {
        setSessions(data);
        const seen = new Map<string, string>();
        data.forEach((s) =>
          s.sets.forEach((set) => {
            const key = set.exercise.id ?? set.exercise.name;
            if (!seen.has(key)) seen.set(key, set.exercise.name);
          })
        );
        setExercises([...seen.entries()].map(([id, name]) => ({ id, name })));
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [session]);

  useEffect(() => {
    if (!selectedExercise || !session?.access_token) return;
    fetch(apiUrl(`/workout-sessions/progress/${selectedExercise.id}`), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((points: ProgressPoint[]) => {
        setChartData(
          points.map((p) => ({
            label: new Date(p.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
            maxWeightKg: p.maxWeightKg,
          }))
        );
      })
      .catch(() => {});
  }, [selectedExercise, session]);

  useEffect(() => {
    if (!selectedSession || !session?.access_token) return;
    fetch(apiUrl(`/workout-sessions/${selectedSession.id}/comments`), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setComments)
      .catch(() => setComments([]));
  }, [selectedSession, session]);

  if (loading || loadingData) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }
  if (!user) return null;

  return (
    <div className="max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Trainingshistorie
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Dein Fortschritt auf einen Blick.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Section title="Sessions">
          <EmptyState text="Du hast noch kein Training aufgezeichnet." />
        </Section>
      ) : (
        <>
          {/* Fortschritt pro Übung */}
          <Section title="Fortschritt pro Übung">
            <div className="flex flex-wrap gap-2 mb-4">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { setSelectedExercise(ex); setSelectedSession(null); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: selectedExercise?.id === ex.id ? "var(--color-accent)" : "var(--color-bg)",
                    color: selectedExercise?.id === ex.id ? "#ffffff" : "var(--color-text-secondary)",
                    border: selectedExercise?.id === ex.id
                      ? "1px solid var(--color-accent)"
                      : "1px solid var(--color-border)",
                  }}
                >
                  {ex.name}
                </button>
              ))}
            </div>

            {selectedExercise && (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {chartData.length === 0 ? (
                  <EmptyState text={`Noch keine Daten für „${selectedExercise.name}".`} />
                ) : (
                  <>
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
                      Max. Gewicht – {selectedExercise.name}
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                          tickLine={false}
                        />
                        <YAxis
                          unit=" kg"
                          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                          tickLine={false}
                          axisLine={false}
                          width={56}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} kg`, "Max. Gewicht"]}
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.85rem",
                            backgroundColor: "var(--color-surface)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="maxWeightKg"
                          stroke="var(--color-accent)"
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: "var(--color-accent)", stroke: "white", strokeWidth: 2 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            )}
          </Section>

          {/* Alle Sessions */}
          <Section title="Alle Sessions">
            <ul className="flex flex-col gap-1.5">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedSession(s)}
                  className="grid gap-2 px-4 py-3 rounded-xl cursor-pointer"
                  style={{
                    gridTemplateColumns: "1fr 1fr auto",
                    alignItems: "center",
                    backgroundColor: selectedSession?.id === s.id ? "var(--color-accent-light)" : "var(--color-bg)",
                    border: selectedSession?.id === s.id
                      ? "1px solid var(--color-accent)"
                      : "1px solid var(--color-border)",
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {new Date(s.date).toLocaleDateString("de-DE", {
                      weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
                    })}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {s.plan?.name ?? "Ohne Plan"}
                  </span>
                  <span className="text-xs text-right" style={{ color: "var(--color-text-muted)" }}>
                    {s.sets.length} Set{s.sets.length !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Session-Detail + Trainer-Kommentare */}
          {selectedSession && (
            <Section title={`Session – ${new Date(selectedSession.date).toLocaleDateString("de-DE")}`}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    {["Übung", "Wdh.", "Gewicht"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "0.4rem 0.6rem",
                          borderBottom: "2px solid var(--color-border)",
                          color: "var(--color-text-secondary)",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSession.sets.map((set, i) => (
                    <tr
                      key={i}
                      style={{ backgroundColor: i % 2 === 0 ? "transparent" : "var(--color-bg)" }}
                    >
                      <td style={{ padding: "0.4rem 0.6rem", color: "var(--color-text-primary)" }}>
                        {set.exercise.name}
                      </td>
                      <td style={{ padding: "0.4rem 0.6rem", color: "var(--color-text-secondary)" }}>
                        {set.reps}
                      </td>
                      <td style={{ padding: "0.4rem 0.6rem", color: "var(--color-text-secondary)" }}>
                        {set.weightKg != null ? `${set.weightKg} kg` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--color-text-muted)" }}>
                  Trainer-Feedback
                </p>
                {comments.length === 0 ? (
                  <EmptyState text="Noch kein Feedback für diese Session." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: "var(--color-warning-light)",
                          border: "1px solid var(--color-warning-text)",
                        }}
                      >
                        <p className="text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
                          {c.text}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-warning-text)" }}>
                          {c.trainer.name ?? "Trainer"} · {new Date(c.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-3"
        style={{ color: "var(--color-text-muted)" }}>
        {title}
      </h2>
      <div className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm" style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
      {text}
    </p>
  );
}
