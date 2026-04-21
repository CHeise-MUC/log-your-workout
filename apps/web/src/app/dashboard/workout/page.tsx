"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, PenLine } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type TrainingPlan = {
  id: string;
  name: string;
  description: string | null;
  _count: { planExercises: number };
};

export default function StartWorkoutPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch("http://localhost:3001/training-plans", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => setError("Pläne konnten nicht geladen werden."));
  }, [session]);

  async function handleStart() {
    if (!session?.access_token) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/workout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId: selectedPlanId ?? undefined }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newSession = await res.json();
      router.push(`/dashboard/workout/${newSession.id}`);
    } catch {
      setError("Session konnte nicht gestartet werden.");
      setStarting(false);
    }
  }

  if (loading || !user) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }

  return (
    <div className="max-w-xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Training starten
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Wähle einen Plan oder trainiere frei.
        </p>
      </div>

      <Section title="Trainingsplan wählen">
        <div className="flex flex-col gap-2">

          {/* Freies Training */}
          <PlanCard
            selected={selectedPlanId === ""}
            onClick={() => setSelectedPlanId("")}
            disabled={false}
          >
            <div className="flex items-center gap-2">
              <PenLine size={15} style={{ color: "var(--color-text-muted)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Freies Training
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Ohne Plan – Übungen frei wählbar
            </p>
          </PlanCard>

          {/* Plan-Karten */}
          {plans.map((plan) => {
            const isEmpty = plan._count.planExercises === 0;
            const isSelected = selectedPlanId === plan.id;
            return (
              <PlanCard
                key={plan.id}
                selected={isSelected}
                onClick={isEmpty ? undefined : () => setSelectedPlanId(plan.id)}
                disabled={isEmpty}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isEmpty ? "var(--color-text-muted)" : "var(--color-text-primary)" }}
                  >
                    {plan.name}
                  </span>
                  {isEmpty ? (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--color-danger-light)",
                        color: "var(--color-danger-text)",
                      }}
                    >
                      Keine Übungen
                    </span>
                  ) : (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--color-success-light)",
                        color: "var(--color-success-text)",
                      }}
                    >
                      {plan._count.planExercises} Übung{plan._count.planExercises !== 1 ? "en" : ""}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {plan.description}
                  </p>
                )}
                {isEmpty && (
                  <button
                    className="text-xs mt-1 cursor-pointer"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-accent-text)",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/training-plans/${plan.id}`);
                    }}
                  >
                    Übungen hinzufügen →
                  </button>
                )}
              </PlanCard>
            );
          })}
        </div>

        {error && (
          <p className="text-sm mt-3" style={{ color: "var(--color-danger-text)" }}>{error}</p>
        )}
      </Section>

      <button
        onClick={handleStart}
        disabled={starting || selectedPlanId === null}
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
        style={{
          backgroundColor: selectedPlanId === null ? "var(--color-border)" : "var(--color-accent)",
          color: selectedPlanId === null ? "var(--color-text-muted)" : "#ffffff",
          border: "none",
          cursor: selectedPlanId === null ? "not-allowed" : "pointer",
          boxShadow: selectedPlanId !== null ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
          transition: "all 0.15s ease",
        }}
      >
        <Zap size={17} />
        {starting ? "Wird gestartet..." : "Training starten"}
      </button>

    </div>
  );
}

function PlanCard({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick?: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="px-4 py-3 rounded-xl"
      style={{
        backgroundColor: selected ? "var(--color-success-light)" : "var(--color-bg)",
        border: selected
          ? "2px solid var(--color-success)"
          : "1px solid var(--color-border)",
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.1s ease",
      }}
    >
      {children}
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
