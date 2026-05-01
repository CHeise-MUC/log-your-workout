"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiUrl } from "@/lib/api";

type LoggedSet = {
  id: string;
  order: number;
  reps: number;
  weightKg: number | null;
  exercise: { name: string };
};

type Session = {
  id: string;
  date: string;
  plan: { name: string } | null;
  sets: LoggedSet[];
};

export default function ClientProgressPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(apiUrl(`/trainer/clients/${clientId}/progress`), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Fortschritt konnte nicht geladen werden.");
        return r.json();
      })
      .then((data) => { setSessions(data); setFetching(false); })
      .catch((err) => { setError(err.message); setFetching(false); });
  }, [session, clientId]);

  if (loading || fetching) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Kunden-Fortschritt
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          {sessions.length} Trainingseinheit{sessions.length !== 1 ? "en" : ""} aufgezeichnet
        </p>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "var(--color-danger-text)" }}>{error}</p>
      )}

      <Section title="Sessions">
        {sessions.length === 0 && !error ? (
          <EmptyState text="Dieser Kunde hat noch keine Sessions aufgezeichnet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((sess) => {
              const isExpanded = expandedId === sess.id;
              const byExercise = sess.sets.reduce<Record<string, LoggedSet[]>>((acc, set) => {
                const key = set.exercise.name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(set);
                return acc;
              }, {});

              return (
                <li
                  key={sess.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Session Header */}
                  <button
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
                    style={{ background: "none", border: "none", textAlign: "left" }}
                    onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {sess.plan?.name ?? "Freies Training"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(sess.date).toLocaleDateString("de-DE", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: "var(--color-accent-light)",
                          color: "var(--color-accent-text)",
                        }}
                      >
                        {sess.sets.length} Sätze
                      </span>
                      {isExpanded
                        ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
                        : <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />}
                    </div>
                  </button>

                  {/* Expanded: Übungen */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4"
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                      {Object.entries(byExercise).map(([name, sets]) => (
                        <div key={name} className="mt-3">
                          <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                            {name}
                          </p>
                          <div className="flex flex-col gap-1">
                            {sets.map((set) => (
                              <div
                                key={set.id}
                                className="flex gap-3 items-center px-3 py-1.5 rounded-lg text-xs"
                                style={{
                                  backgroundColor: "var(--color-success-light)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                <span
                                  className="font-semibold w-12 flex-shrink-0"
                                  style={{ color: "var(--color-success-text)" }}
                                >
                                  Satz {set.order}
                                </span>
                                <span>
                                  {set.reps} Wdh.
                                  {set.weightKg != null
                                    ? ` × ${set.weightKg} kg`
                                    : " (Körpergewicht)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
