"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, TrendingUp, CalendarDays, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type WorkoutSession = {
  id: string;
  date: string;
  plan: { name: string } | null;
  sets: Array<{ exercise: { name: string }; reps: number; weightKg: number | null }>;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const { user, session } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch("http://localhost:3001/v1/workout-sessions", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data: WorkoutSession[]) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, [session]);

  const displayName =
    user?.user_metadata?.name ??
    user?.email?.replace(/@.*/, "") ??
    "Unknown User";

  const lastSession = sessions[sessions.length - 1] ?? null;
  const totalSets = sessions.reduce((sum, s) => sum + s.sets.length, 0);

  // Unique exercises ever logged
  const uniqueExercises = new Set(
    sessions.flatMap((s) => s.sets.map((set) => set.exercise.name))
  ).size;

  return (
    <div className="max-w-3xl">

      {/* Begrüßung */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}>
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Hier ist dein Trainingsüberblick.
        </p>
      </div>

      {/* Statistik-Kacheln */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={CalendarDays}
          label="Trainingseinheiten"
          value={loadingSessions ? "–" : String(sessions.length)}
        />
        <StatCard
          icon={Dumbbell}
          label="Verschiedene Übungen"
          value={loadingSessions ? "–" : String(uniqueExercises)}
        />
        <StatCard
          icon={TrendingUp}
          label="Sets insgesamt"
          value={loadingSessions ? "–" : String(totalSets)}
        />
      </div>

      {/* Letzte Session */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-muted)" }}>
          Letzte Session
        </h2>

        {loadingSessions ? (
          <div className="rounded-xl p-5" style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>
          </div>
        ) : lastSession ? (
          <div
            className="rounded-xl p-5 cursor-pointer"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-card)",
              transition: "box-shadow 0.15s ease",
            }}
            onClick={() => router.push("/dashboard/history")}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-lg)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {lastSession.plan?.name ?? "Ohne Plan"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {new Date(lastSession.date).toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {lastSession.sets.length} {lastSession.sets.length === 1 ? "Set" : "Sets"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {new Set(lastSession.sets.map((s) => s.exercise.name)).size} Übungen
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{
            backgroundColor: "var(--color-surface)",
            border: "1px dashed var(--color-border)",
          }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Noch kein Training aufgezeichnet.
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Starte deine erste Session und sie erscheint hier.
            </p>
          </div>
        )}
      </div>

      {/* Quick Action */}
      <button
        onClick={() => router.push("/dashboard/workout")}
        className="flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          transition: "opacity 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.92";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(79, 70, 229, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
        }}
      >
        <Zap size={18} />
        Training starten
      </button>
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────
import type { LucideIcon } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Icon size={18} style={{ color: "var(--color-accent)", marginBottom: "0.75rem" }} />
      <p className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
