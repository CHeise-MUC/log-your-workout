"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Visibility = "PRIVATE" | "PUBLIC";

type TrainingPlan = {
  id: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  createdAt: string;
};

type PublicPlan = TrainingPlan & {
  user: { name: string | null; email: string };
};

export default function TrainingPlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [myPlans, setMyPlans] = useState<TrainingPlan[]>([]);
  const [publicPlans, setPublicPlans] = useState<PublicPlan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"mine" | "public">("mine");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    Promise.all([
      fetch("http://localhost:3001/training-plans", { headers }).then((r) => r.json()),
      fetch("http://localhost:3001/training-plans/public", { headers }).then((r) => r.json()),
    ])
      .then(([mine, publicOnes]) => {
        setMyPlans(mine);
        setPublicPlans(publicOnes);
        setFetching(false);
      })
      .catch(() => { setError("Pläne konnten nicht geladen werden."); setFetching(false); });
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/training-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, description: description || undefined, visibility }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newPlan: TrainingPlan = await res.json();
      setMyPlans((prev) => [newPlan, ...prev]);
      if (newPlan.visibility === "PUBLIC") {
        const publicVersion: PublicPlan = {
          ...newPlan,
          user: { name: user!.user_metadata?.name ?? null, email: user!.email! },
        };
        setPublicPlans((prev) => [publicVersion, ...prev]);
      }
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
    } catch {
      setError("Plan konnte nicht gespeichert werden.");
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
          Trainingspläne
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Erstelle und entdecke Trainingspläne.
        </p>
      </div>

      {/* Neuen Plan erstellen */}
      <Section title="Neuen Plan erstellen">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name (z.B. Push/Pull/Legs)"
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

          {/* Sichtbarkeit */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisibility("PRIVATE")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: visibility === "PRIVATE" ? "var(--color-accent)" : "var(--color-bg)",
                color: visibility === "PRIVATE" ? "#ffffff" : "var(--color-text-secondary)",
                border: `1px solid ${visibility === "PRIVATE" ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              <Lock size={13} /> Privat
            </button>
            <button
              type="button"
              onClick={() => setVisibility("PUBLIC")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: visibility === "PUBLIC" ? "var(--color-accent)" : "var(--color-bg)",
                color: visibility === "PUBLIC" ? "#ffffff" : "var(--color-text-secondary)",
                border: `1px solid ${visibility === "PUBLIC" ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              <Globe size={13} /> Öffentlich
            </button>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {visibility === "PRIVATE"
              ? "Nur du kannst diesen Plan sehen."
              : "Alle eingeloggten Nutzer können diesen Plan entdecken."}
          </p>

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
            {saving ? "Speichern..." : "Plan erstellen"}
          </button>
        </form>
      </Section>

      {/* Plan-Liste mit Tabs */}
      <Section title="Pläne">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }}>
          {(["mine", "public"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
              style={{
                backgroundColor: activeTab === tab ? "var(--color-surface)" : "transparent",
                color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
                border: "none",
                boxShadow: activeTab === tab ? "var(--shadow-card)" : "none",
              }}
            >
              {tab === "mine" ? `Meine Pläne (${myPlans.length})` : `Öffentliche Pläne (${publicPlans.length})`}
            </button>
          ))}
        </div>

        {fetching ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Lädt...</p>
        ) : activeTab === "mine" ? (
          <PlanList plans={myPlans} showOwner={false} onNavigate={(id) => router.push(`/dashboard/training-plans/${id}`)} />
        ) : (
          <PlanList plans={publicPlans} showOwner={true} onNavigate={null} />
        )}
      </Section>

    </div>
  );
}

function PlanList({
  plans,
  showOwner,
  onNavigate,
}: {
  plans: (TrainingPlan | PublicPlan)[];
  showOwner: boolean;
  onNavigate: ((id: string) => void) | null;
}) {
  if (plans.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
        Keine Pläne vorhanden.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {plans.map((plan) => (
        <li
          key={plan.id}
          className="px-4 py-3 rounded-xl"
          onClick={onNavigate ? () => onNavigate(plan.id) : undefined}
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            cursor: onNavigate ? "pointer" : "default",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {plan.name}
            </p>
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: plan.visibility === "PUBLIC" ? "var(--color-success-light)" : "var(--color-border)",
                color: plan.visibility === "PUBLIC" ? "var(--color-success-text)" : "var(--color-text-muted)",
              }}
            >
              {plan.visibility === "PUBLIC"
                ? <><Globe size={10} /> Öffentlich</>
                : <><Lock size={10} /> Privat</>}
            </span>
          </div>
          {plan.description && (
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {plan.description}
            </p>
          )}
          {showOwner && "user" in plan && (
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              von {(plan as PublicPlan).user.name ?? (plan as PublicPlan).user.email}
            </p>
          )}
        </li>
      ))}
    </ul>
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
