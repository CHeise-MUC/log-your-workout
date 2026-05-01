"use client";

// The active workout session page.
// Shows the exercises from the linked plan (with target sets/reps),
// and lets the user log each set with actual weight and reps.

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Exercise = { id: string; name: string };

type PlanExercise = {
  id: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  exercise: Exercise;
};

type LoggedSet = {
  id: string;
  order: number;
  reps: number;
  weightKg: number | null;
  exercise: { name: string; id: string };
};

type WorkoutSession = {
  id: string;
  date: string;
  plan: {
    name: string;
    planExercises: PlanExercise[];
  } | null;
  sets: LoggedSet[];
};

export default function ActiveSessionPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which exercise is currently selected for logging
  const [activeExerciseId, setActiveExerciseId] = useState<string>("");
  const [reps, setReps] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    fetch(`http://localhost:3001/v1/workout-sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Session nicht gefunden");
        return r.json();
      })
      .then((data: WorkoutSession) => {
        setWorkout(data);
        // Pre-select the first exercise in the plan
        if (data.plan?.planExercises.length) {
          setActiveExerciseId(data.plan.planExercises[0].exercise.id);
        }
        setFetching(false);
      })
      .catch((err) => {
        setError(err.message);
        setFetching(false);
      });
  }, [session, sessionId]);

  async function handleLogSet(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token || !activeExerciseId) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3001/v1/workout-sessions/${sessionId}/sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          exerciseId: activeExerciseId,
          reps: Number(reps),
          weightKg: weightKg ? Number(weightKg) : undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newSet: LoggedSet = await res.json();

      // Add the new set to the workout state without re-fetching
      setWorkout((prev) =>
        prev ? { ...prev, sets: [...prev.sets, newSet] } : prev,
      );

      // Reset the reps/weight fields but keep the selected exercise
      setReps("");
      setWeightKg("");
    } catch {
      setError("Satz konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user || fetching) return <div style={styles.container}><p>Lädt...</p></div>;
  if (error && !workout) return <div style={styles.container}><p style={{ color: "#e53e3e" }}>{error}</p></div>;
  if (!workout) return null;

  // Group logged sets by exercise ID for easy display
  const setsByExercise = workout.sets.reduce<Record<string, LoggedSet[]>>((acc, s) => {
    const key = s.exercise.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const planExercises = workout.plan?.planExercises ?? [];

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backLink}>
            ← Zurück
          </button>
          <h1 style={styles.heading}>
            {workout.plan ? workout.plan.name : "Freies Training"}
          </h1>
          <p style={styles.date}>
            {new Date(workout.date).toLocaleDateString("de-DE", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        {/* Log a set */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>Satz eintragen</h2>
          <form onSubmit={handleLogSet} style={styles.form}>
            {planExercises.length > 0 ? (
              <select
                style={styles.select}
                value={activeExerciseId}
                onChange={(e) => setActiveExerciseId(e.target.value)}
              >
                {planExercises.map((pe) => (
                  <option key={pe.exercise.id} value={pe.exercise.id}>
                    {pe.exercise.name}
                    {pe.targetSets && pe.targetReps
                      ? ` (Ziel: ${pe.targetSets}×${pe.targetReps})`
                      : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                Kein Plan verknüpft – Sätze werden ohne Übungszuordnung gespeichert.
              </p>
            )}

            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wiederholungen</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="z.B. 8"
                  min={1}
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Gewicht (kg)</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="z.B. 80"
                  min={0}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.logButton} disabled={saving || !activeExerciseId}>
              {saving ? "Speichern..." : "✓ Satz speichern"}
            </button>
          </form>
        </div>

        {/* Logged sets, grouped by exercise */}
        {planExercises.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.subheading}>Eingetragene Sätze</h2>
            {planExercises.map((pe) => {
              const logged = setsByExercise[pe.exercise.id] ?? [];
              return (
                <div key={pe.id} style={styles.exerciseBlock}>
                  <div style={styles.exerciseHeader}>
                    <span style={styles.exerciseName}>{pe.exercise.name}</span>
                    <span style={styles.exerciseTarget}>
                      {pe.targetSets && pe.targetReps
                        ? `Ziel: ${pe.targetSets} × ${pe.targetReps} Wdh.`
                        : "Keine Vorgabe"}
                    </span>
                  </div>
                  {logged.length === 0 ? (
                    <p style={styles.noSets}>Noch keine Sätze</p>
                  ) : (
                    <div style={styles.setList}>
                      {logged.map((s) => (
                        <div key={s.id} style={styles.setRow}>
                          <span style={styles.setOrder}>Satz {s.order}</span>
                          <span style={styles.setValues}>
                            {s.reps} Wdh.
                            {s.weightKg != null ? ` × ${s.weightKg} kg` : " (Körpergewicht)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Finish button */}
        <button
          onClick={() => router.push("/dashboard/workout/history")}
          style={styles.finishButton}
        >
          Training beenden → Historie anzeigen
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "sans-serif", padding: "2rem" },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.9rem", padding: "0", marginBottom: "0.5rem", display: "block" },
  heading: { margin: "0 0 0.25rem", fontSize: "1.8rem" },
  date: { margin: "0", color: "#666", fontSize: "0.9rem" },
  card: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
  subheading: { margin: "0 0 1rem", fontSize: "1.1rem" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
  select: { padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1rem" },
  row: { display: "flex", gap: "0.75rem" },
  fieldGroup: { flex: 1, display: "flex", flexDirection: "column" as const, gap: "0.3rem" },
  label: { fontSize: "0.85rem", fontWeight: "bold" as const, color: "#444" },
  input: { padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1rem" },
  error: { color: "#e53e3e", fontSize: "0.9rem", margin: "0" },
  logButton: { padding: "0.7rem", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" as const },
  exerciseBlock: { marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid #eee" },
  exerciseHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" },
  exerciseName: { fontWeight: "bold" as const },
  exerciseTarget: { fontSize: "0.8rem", color: "#888" },
  noSets: { color: "#aaa", fontSize: "0.85rem", fontStyle: "italic" as const, margin: "0" },
  setList: { display: "flex", flexDirection: "column" as const, gap: "0.3rem" },
  setRow: { display: "flex", gap: "1rem", fontSize: "0.9rem", padding: "0.3rem 0.5rem", backgroundColor: "#f0fff4", borderRadius: "4px" },
  setOrder: { color: "#276749", fontWeight: "bold" as const, minWidth: "60px" },
  setValues: { color: "#333" },
  finishButton: { width: "100%", padding: "0.9rem", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" },
} as const;
