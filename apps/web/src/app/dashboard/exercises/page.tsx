"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// The shape of an exercise as returned by the API
type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  description: string | null;
};

export default function ExercisesPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Load all exercises from the backend when the session is ready
  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/exercises", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setExercises(data);
        setFetching(false);
      })
      .catch(() => {
        setError("Übungen konnten nicht geladen werden.");
        setFetching(false);
      });
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); // prevent page reload on form submit
    if (!session?.access_token) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, muscleGroup, description: description || undefined }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newExercise: Exercise = await res.json();

      // Add the new exercise to the list without re-fetching everything
      setExercises((prev) => [...prev, newExercise].sort((a, b) => a.name.localeCompare(b.name)));

      // Reset the form
      setName("");
      setMuscleGroup("");
      setDescription("");
    } catch {
      setError("Übung konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backLink}>
            ← Zurück
          </button>
          <h1 style={styles.heading}>Übungen</h1>
        </div>

        {/* Form: create new exercise */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>Neue Übung anlegen</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="Name (z.B. Bankdrücken)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Muskelgruppe (z.B. Brust)"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Beschreibung (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button} disabled={saving}>
              {saving ? "Speichern..." : "Übung hinzufügen"}
            </button>
          </form>
        </div>

        {/* List: all exercises */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>Alle Übungen ({exercises.length})</h2>
          {fetching ? (
            <p>Lädt...</p>
          ) : exercises.length === 0 ? (
            <p style={styles.empty}>Noch keine Übungen angelegt.</p>
          ) : (
            <ul style={styles.list}>
              {exercises.map((ex) => (
                <li key={ex.id} style={styles.listItem}>
                  <div style={styles.exerciseName}>{ex.name}</div>
                  <div style={styles.exerciseMeta}>{ex.muscleGroup}</div>
                  {ex.description && (
                    <div style={styles.exerciseDesc}>{ex.description}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif",
    padding: "2rem",
  },
  inner: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "1.5rem",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "0",
    marginBottom: "0.5rem",
    display: "block",
  },
  heading: {
    margin: "0",
    fontSize: "1.8rem",
  },
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
  },
  subheading: {
    margin: "0 0 1rem",
    fontSize: "1.1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  input: {
    padding: "0.6rem 0.8rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  button: {
    padding: "0.7rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  error: {
    color: "#e53e3e",
    fontSize: "0.9rem",
    margin: "0",
  },
  list: {
    listStyle: "none",
    padding: "0",
    margin: "0",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  listItem: {
    padding: "0.75rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  exerciseName: {
    fontWeight: "bold" as const,
    fontSize: "1rem",
  },
  exerciseMeta: {
    color: "#666",
    fontSize: "0.85rem",
    marginTop: "0.2rem",
  },
  exerciseDesc: {
    color: "#888",
    fontSize: "0.85rem",
    marginTop: "0.2rem",
    fontStyle: "italic" as const,
  },
  empty: {
    color: "#888",
    fontStyle: "italic" as const,
  },
} as const;
