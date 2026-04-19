"use client";

// Assigned Plans page – client view.
// Shows all training plans that a trainer has assigned to this user.
// Plans are read-only: the client can view and use them for workouts,
// but cannot edit or delete them.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type PlanExercise = {
  id: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  exercise: { name: string; muscleGroup: string };
};

type AssignedPlan = {
  id: string;
  assignedAt: string;
  trainer: { name: string | null; email: string };
  plan: {
    id: string;
    name: string;
    description: string | null;
    planExercises: PlanExercise[];
  };
};

export default function AssignedPlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [assignments, setAssignments] = useState<AssignedPlan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    fetch("http://localhost:3001/users/me/assigned-plans", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setAssignments(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [session]);

  if (loading || fetching) return <div style={s.page}><p>Lädt...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <button onClick={() => router.push("/dashboard")} style={s.backLink}>← Dashboard</button>
          <h1 style={s.heading}>Vom Trainer zugewiesene Pläne</h1>
        </div>

        {assignments.length === 0 ? (
          <div style={s.card}>
            <p style={s.empty}>Dir wurden noch keine Pläne von einem Trainer zugewiesen.</p>
          </div>
        ) : (
          assignments.map((a) => {
            const isExpanded = expandedId === a.id;
            return (
              <div key={a.id} style={s.card}>
                {/* Plan header */}
                <div
                  style={s.planHeader}
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  role="button"
                >
                  <div>
                    <div style={s.planName}>{a.plan.name}</div>
                    <div style={s.trainerInfo}>
                      von {a.trainer.name ?? a.trainer.email} ·{" "}
                      zugewiesen am{" "}
                      {new Date(a.assignedAt).toLocaleDateString("de-DE")}
                    </div>
                    {a.plan.description && (
                      <div style={s.planDesc}>{a.plan.description}</div>
                    )}
                  </div>
                  <span style={s.chevron}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Exercise list (expanded) */}
                {isExpanded && (
                  <div style={{ marginTop: "1rem" }}>
                    <hr style={s.divider} />
                    <p style={s.exercisesLabel}>
                      Übungen ({a.plan.planExercises.length})
                    </p>
                    <ol style={s.exerciseList}>
                      {a.plan.planExercises.map((pe) => (
                        <li key={pe.id} style={s.exerciseItem}>
                          <div style={s.exerciseName}>{pe.exercise.name}</div>
                          <div style={s.exerciseMeta}>
                            {pe.exercise.muscleGroup}
                            {pe.targetSets && pe.targetReps
                              ? ` · ${pe.targetSets} × ${pe.targetReps} Wdh.`
                              : ""}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {/* Use this plan for a workout */}
                    <button
                      style={s.useButton}
                      onClick={() => router.push(`/dashboard/workout?planId=${a.plan.id}`)}
                    >
                      🏋️ Diesen Plan trainieren
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

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "sans-serif", padding: "2rem" },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.9rem", padding: 0, marginBottom: "0.5rem", display: "block" },
  heading: { margin: "0", fontSize: "1.8rem" },
  card: { backgroundColor: "white", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1rem" },
  planHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" },
  planName: { fontWeight: "bold" as const, fontSize: "1.05rem" },
  trainerInfo: { color: "#888", fontSize: "0.8rem", marginTop: "0.2rem" },
  planDesc: { color: "#555", fontSize: "0.9rem", marginTop: "0.3rem" },
  chevron: { color: "#999", fontSize: "0.8rem", marginLeft: "0.5rem" },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "0.75rem 0" },
  exercisesLabel: { fontWeight: "bold" as const, fontSize: "0.9rem", marginBottom: "0.5rem" },
  exerciseList: { padding: "0 0 0 1.2rem", margin: "0 0 1rem", display: "flex", flexDirection: "column" as const, gap: "0.4rem" },
  exerciseItem: { padding: "0.5rem 0.75rem", backgroundColor: "#f9f9f9", borderRadius: "4px", border: "1px solid #eee" },
  exerciseName: { fontWeight: "bold" as const, fontSize: "0.9rem" },
  exerciseMeta: { color: "#888", fontSize: "0.8rem", marginTop: "0.1rem" },
  useButton: { width: "100%", padding: "0.7rem", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem" },
  empty: { color: "#888", fontStyle: "italic" as const },
} as const;
