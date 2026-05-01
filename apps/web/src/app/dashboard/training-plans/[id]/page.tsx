"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
};

type PlanExercise = {
  id: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  exercise: Exercise;
};

type TrainingPlan = {
  id: string;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  planExercises: PlanExercise[];
};

export default function TrainingPlanDetailPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  // useParams() reads the [id] value from the URL.
  // e.g. /dashboard/training-plans/abc123 → params.id = "abc123"
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form state
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Load the plan details and all available exercises in parallel
  useEffect(() => {
    if (!session?.access_token) return;

    const headers = { Authorization: `Bearer ${session.access_token}` };

    Promise.all([
      fetch(`http://localhost:3001/v1/training-plans/${planId}`, { headers }).then((r) => {
        if (!r.ok) throw new Error("Plan nicht gefunden");
        return r.json();
      }),
      fetch("http://localhost:3001/v1/exercises", { headers }).then((r) => r.json()),
    ])
      .then(([planData, exercisesData]) => {
        setPlan(planData);
        setAllExercises(exercisesData);
        if (exercisesData.length > 0) setSelectedExerciseId(exercisesData[0].id);
        setFetching(false);
      })
      .catch((err) => {
        setError(err.message);
        setFetching(false);
      });
  }, [session, planId]);

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token || !selectedExerciseId) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3001/v1/training-plans/${planId}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          exerciseId: selectedExerciseId,
          targetSets: targetSets ? Number(targetSets) : undefined,
          targetReps: targetReps ? Number(targetReps) : undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newPlanExercise: PlanExercise = await res.json();

      // Add the new exercise to the plan without re-fetching everything
      setPlan((prev) =>
        prev
          ? { ...prev, planExercises: [...prev.planExercises, newPlanExercise] }
          : prev,
      );

      // Reset form
      setTargetSets("");
      setTargetReps("");
    } catch {
      setError("Übung konnte nicht hinzugefügt werden.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return <div style={styles.container}><p>Loading...</p></div>;
  if (fetching) return <div style={styles.container}><p>Plan wird geladen...</p></div>;
  if (error && !plan) return <div style={styles.container}><p style={styles.errorText}>{error}</p></div>;
  if (!plan) return null;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        {/* Header */}
        <div style={styles.header}>
          <button
            onClick={() => router.back()}
            style={styles.backLink}
          >
            ← Zurück
          </button>
          <div style={styles.titleRow}>
            <h1 style={styles.heading}>{plan.name}</h1>
            <span style={{
              ...styles.badge,
              ...(plan.visibility === "PUBLIC" ? styles.badgePublic : styles.badgePrivate),
            }}>
              {plan.visibility === "PUBLIC" ? "🌍 Öffentlich" : "🔒 Privat"}
            </span>
          </div>
          {plan.description && <p style={styles.description}>{plan.description}</p>}
        </div>

        {/* Current exercises in this plan */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>
            Übungen in diesem Plan ({plan.planExercises.length})
          </h2>
          {plan.planExercises.length === 0 ? (
            <p style={styles.empty}>Noch keine Übungen hinzugefügt.</p>
          ) : (
            <ol style={styles.exerciseList}>
              {plan.planExercises.map((pe) => (
                <li key={pe.id} style={styles.exerciseItem}>
                  <div style={styles.exerciseMain}>
                    <span style={styles.exerciseName}>{pe.exercise.name}</span>
                    <span style={styles.exerciseMuscle}>{pe.exercise.muscleGroup}</span>
                  </div>
                  <div style={styles.exerciseMeta}>
                    {pe.targetSets && <span>{pe.targetSets} Sätze</span>}
                    {pe.targetSets && pe.targetReps && <span> × </span>}
                    {pe.targetReps && <span>{pe.targetReps} Wdh.</span>}
                    {!pe.targetSets && !pe.targetReps && <span style={styles.noTarget}>Keine Vorgabe</span>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Form: add exercise to plan */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>Übung hinzufügen</h2>
          {allExercises.length === 0 ? (
            <p style={styles.empty}>
              Zuerst Übungen im{" "}
              <button
                style={styles.inlineLink}
                onClick={() => router.push("/dashboard/exercises")}
              >
                Übungskatalog
              </button>{" "}
              anlegen.
            </p>
          ) : (
            <form onSubmit={handleAddExercise} style={styles.form}>
              <select
                style={styles.select}
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                required
              >
                {allExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.muscleGroup})
                  </option>
                ))}
              </select>

              <div style={styles.row}>
                <input
                  style={styles.inputSmall}
                  type="number"
                  placeholder="Sätze (z.B. 4)"
                  min={1}
                  value={targetSets}
                  onChange={(e) => setTargetSets(e.target.value)}
                />
                <input
                  style={styles.inputSmall}
                  type="number"
                  placeholder="Wdh. (z.B. 8)"
                  min={1}
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                />
              </div>

              {error && <p style={styles.errorText}>{error}</p>}

              <button type="submit" style={styles.button} disabled={saving}>
                {saving ? "Hinzufügen..." : "Übung hinzufügen"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif", padding: "2rem",
  },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: {
    background: "none", border: "none", color: "#666", cursor: "pointer",
    fontSize: "0.9rem", padding: "0", marginBottom: "0.5rem", display: "block",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  heading: { margin: "0", fontSize: "1.8rem" },
  description: { margin: "0.5rem 0 0", color: "#555", fontSize: "0.95rem" },
  badge: {
    fontSize: "0.75rem", padding: "0.2rem 0.6rem",
    borderRadius: "999px", fontWeight: "bold" as const,
  },
  badgePublic: { backgroundColor: "#c6f6d5", color: "#276749" },
  badgePrivate: { backgroundColor: "#e2e8f0", color: "#4a5568" },
  card: {
    backgroundColor: "white", padding: "1.5rem", borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1.5rem",
  },
  subheading: { margin: "0 0 1rem", fontSize: "1.1rem" },
  exerciseList: { padding: "0 0 0 1.2rem", margin: "0", display: "flex", flexDirection: "column" as const, gap: "0.6rem" },
  exerciseItem: { padding: "0.6rem 0.75rem", backgroundColor: "#f9f9f9", borderRadius: "4px", border: "1px solid #eee" },
  exerciseMain: { display: "flex", alignItems: "baseline", gap: "0.5rem" },
  exerciseName: { fontWeight: "bold" as const },
  exerciseMuscle: { fontSize: "0.8rem", color: "#888" },
  exerciseMeta: { marginTop: "0.2rem", fontSize: "0.85rem", color: "#555" },
  noTarget: { color: "#aaa", fontStyle: "italic" as const },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
  select: { padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1rem" },
  row: { display: "flex", gap: "0.75rem" },
  inputSmall: {
    flex: 1, padding: "0.6rem 0.8rem", border: "1px solid #ddd",
    borderRadius: "4px", fontSize: "1rem",
  },
  button: {
    padding: "0.7rem", backgroundColor: "#3182ce", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem",
  },
  errorText: { color: "#e53e3e", fontSize: "0.9rem", margin: "0" },
  empty: { color: "#888", fontStyle: "italic" as const, margin: "0" },
  inlineLink: {
    background: "none", border: "none", color: "#3182ce",
    cursor: "pointer", fontSize: "inherit", padding: "0", textDecoration: "underline",
  },
} as const;
