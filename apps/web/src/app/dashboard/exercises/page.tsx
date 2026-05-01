"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch("http://localhost:3001/v1/exercises", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => { setExercises(data); setFetching(false); })
      .catch(() => { setError("Übungen konnten nicht geladen werden."); setFetching(false); });
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/v1/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, muscleGroup, description: description || undefined }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newExercise: Exercise = await res.json();
      setExercises((prev) => [...prev, newExercise].sort((a, b) => a.name.localeCompare(b.name)));
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
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Übungen
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Verwalte deine Übungsbibliothek.
        </p>
      </div>

      {/* Neue Übung anlegen */}
      <Section title="Neue Übung anlegen">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name (z.B. Bankdrücken)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Muskelgruppe (z.B. Brust)"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Beschreibung (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          {error && (
            <p className="text-sm" style={{ color: "var(--color-danger-text)" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer self-start"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#ffffff",
              border: "none",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Speichern..." : "Übung hinzufügen"}
          </button>
        </form>
      </Section>

      {/* Übungsliste */}
      <Section title={`Alle Übungen (${exercises.length})`}>
        {fetching ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Lädt...</p>
        ) : exercises.length === 0 ? (
          <EmptyState text="Noch keine Übungen angelegt." />
        ) : (
          <ul className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {ex.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {ex.muscleGroup}
                </p>
                {ex.description && (
                  <p className="text-xs mt-0.5 italic" style={{ color: "var(--color-text-muted)" }}>
                    {ex.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

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
