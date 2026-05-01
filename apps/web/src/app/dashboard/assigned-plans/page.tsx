"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/api";

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

type Invitation = {
  id: string;
  createdAt: string;
  trainer: { id: string; name: string | null; email: string };
};

export default function AssignedPlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [assignments, setAssignments] = useState<AssignedPlan[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    Promise.all([
      fetch(apiUrl("/users/me/assigned-plans"), { headers }).then((r) => r.json()),
      fetch(apiUrl("/users/me/invitations"), { headers }).then((r) => r.json()),
    ])
      .then(([plansData, invitationsData]) => {
        setAssignments(plansData);
        setInvitations(invitationsData);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [session]);

  async function handleAccept(invitationId: string) {
    if (!session?.access_token) return;
    setAccepting(invitationId);
    try {
      const res = await fetch(
        apiUrl(`/users/me/invitations/${invitationId}/accept`),
        { method: "PATCH", headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error("Fehler");
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch {
      // Silent fail
    } finally {
      setAccepting(null);
    }
  }

  if (loading || fetching) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Zugewiesene Pläne
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Pläne, die dein Trainer für dich zusammengestellt hat.
        </p>
      </div>

      {/* Ausstehende Einladungen */}
      {invitations.length > 0 && (
        <Section title="Ausstehende Einladungen">
          <ul className="flex flex-col gap-2">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {inv.trainer.name ?? inv.trainer.email} möchte dein Trainer sein
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    Eingeladen am {new Date(inv.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(inv.id)}
                  disabled={accepting === inv.id}
                  className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--color-success)",
                    color: "#ffffff",
                    border: "none",
                    opacity: accepting === inv.id ? 0.7 : 1,
                  }}
                >
                  {accepting === inv.id ? "..." : "Annehmen"}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Zugewiesene Pläne */}
      <Section title="Meine Pläne vom Trainer">
        {assignments.length === 0 ? (
          <EmptyState text="Dir wurden noch keine Pläne von einem Trainer zugewiesen." />
        ) : (
          <ul className="flex flex-col gap-2">
            {assignments.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <li
                  key={a.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Plan Header */}
                  <button
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
                    style={{ background: "none", border: "none", textAlign: "left" }}
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {a.plan.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        von {a.trainer.name ?? a.trainer.email} · zugewiesen am{" "}
                        {new Date(a.assignedAt).toLocaleDateString("de-DE")}
                      </p>
                      {a.plan.description && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                          {a.plan.description}
                        </p>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />}
                  </button>

                  {/* Expanded: Übungsliste */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4"
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest mt-3 mb-2"
                        style={{ color: "var(--color-text-muted)" }}>
                        Übungen ({a.plan.planExercises.length})
                      </p>
                      <ol className="flex flex-col gap-1.5 mb-4">
                        {a.plan.planExercises.map((pe, i) => (
                          <li
                            key={pe.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg"
                            style={{
                              backgroundColor: "var(--color-surface)",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            <span
                              className="text-xs font-bold w-5 text-center flex-shrink-0"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                {pe.exercise.name}
                              </p>
                              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                {pe.exercise.muscleGroup}
                                {pe.targetSets && pe.targetReps
                                  ? ` · ${pe.targetSets} × ${pe.targetReps} Wdh.`
                                  : ""}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <button
                        onClick={() => router.push(`/dashboard/workout?planId=${a.plan.id}`)}
                        className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "#ffffff",
                          border: "none",
                        }}
                      >
                        <Zap size={15} />
                        Diesen Plan trainieren
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
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
