"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Load my plans and all public plans
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
      .catch(() => {
        setError("Pläne konnten nicht geladen werden.");
        setFetching(false);
      });
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
        body: JSON.stringify({
          name,
          description: description || undefined,
          visibility,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const newPlan: TrainingPlan = await res.json();
      setMyPlans((prev) => [newPlan, ...prev]);

      // If the new plan is public, add it to the public feed immediately
      // so the user sees it without needing a page reload.
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
          <h1 style={styles.heading}>Trainingspläne</h1>
        </div>

        {/* Form: create new plan */}
        <div style={styles.card}>
          <h2 style={styles.subheading}>Neuen Plan erstellen</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="Name (z.B. Push/Pull/Legs)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Beschreibung (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Visibility toggle */}
            <div style={styles.visibilityRow}>
              <span style={styles.visibilityLabel}>Sichtbarkeit:</span>
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setVisibility("PRIVATE")}
                  style={{
                    ...styles.toggleButton,
                    ...(visibility === "PRIVATE" ? styles.toggleActive : styles.toggleInactive),
                  }}
                >
                  🔒 Privat
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("PUBLIC")}
                  style={{
                    ...styles.toggleButton,
                    ...(visibility === "PUBLIC" ? styles.toggleActive : styles.toggleInactive),
                  }}
                >
                  🌍 Öffentlich
                </button>
              </div>
              <p style={styles.visibilityHint}>
                {visibility === "PRIVATE"
                  ? "Nur du kannst diesen Plan sehen."
                  : "Alle eingeloggten User können diesen Plan entdecken."}
              </p>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.submitButton} disabled={saving}>
              {saving ? "Speichern..." : "Plan erstellen"}
            </button>
          </form>
        </div>

        {/* Tabs: My plans / Public plans */}
        <div style={styles.card}>
          <div style={styles.tabRow}>
            <button
              style={{ ...styles.tab, ...(activeTab === "mine" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("mine")}
            >
              Meine Pläne ({myPlans.length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === "public" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("public")}
            >
              🌍 Öffentliche Pläne ({publicPlans.length})
            </button>
          </div>

          {fetching ? (
            <p>Lädt...</p>
          ) : activeTab === "mine" ? (
            <PlanList plans={myPlans} showOwner={false} />
          ) : (
            <PlanList plans={publicPlans} showOwner={true} />
          )}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PlanList: reusable component for rendering a list of plans
// ─────────────────────────────────────────────
function PlanList({
  plans,
  showOwner,
}: {
  plans: (TrainingPlan | PublicPlan)[];
  showOwner: boolean;
}) {
  const router = useRouter();

  if (plans.length === 0) {
    return <p style={styles.empty}>Keine Pläne vorhanden.</p>;
  }

  return (
    <ul style={styles.list}>
      {plans.map((plan) => (
        <li
          key={plan.id}
          style={styles.listItem}
          // Only own plans are clickable – public plans from others are read-only
          onClick={!showOwner ? () => router.push(`/dashboard/training-plans/${plan.id}`) : undefined}
          role={!showOwner ? "button" : undefined}
          title={!showOwner ? "Plan öffnen" : undefined}
        >
          <div style={styles.planHeader}>
            <span style={styles.planName}>{plan.name}</span>
            <span
              style={{
                ...styles.badge,
                ...(plan.visibility === "PUBLIC" ? styles.badgePublic : styles.badgePrivate),
              }}
            >
              {plan.visibility === "PUBLIC" ? "🌍 Öffentlich" : "🔒 Privat"}
            </span>
          </div>
          {plan.description && (
            <p style={styles.planDesc}>{plan.description}</p>
          )}
          {showOwner && "user" in plan && (
            <p style={styles.planOwner}>
              von {(plan as PublicPlan).user.name ?? (plan as PublicPlan).user.email}
            </p>
          )}
          {!showOwner && (
            <p style={styles.planHint}>Klicken zum Öffnen →</p>
          )}
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "sans-serif",
    padding: "2rem",
  },
  inner: { maxWidth: "640px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: {
    background: "none", border: "none", color: "#666",
    cursor: "pointer", fontSize: "0.9rem", padding: "0",
    marginBottom: "0.5rem", display: "block",
  },
  heading: { margin: "0", fontSize: "1.8rem" },
  card: {
    backgroundColor: "white", padding: "1.5rem",
    borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
  },
  subheading: { margin: "0 0 1rem", fontSize: "1.1rem" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
  input: {
    padding: "0.6rem 0.8rem", border: "1px solid #ddd",
    borderRadius: "4px", fontSize: "1rem",
  },
  visibilityRow: { display: "flex", flexDirection: "column" as const, gap: "0.4rem" },
  visibilityLabel: { fontWeight: "bold" as const, fontSize: "0.9rem" },
  toggleGroup: { display: "flex", gap: "0.5rem" },
  toggleButton: {
    padding: "0.5rem 1rem", border: "2px solid transparent",
    borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem",
    fontWeight: "bold" as const,
  },
  toggleActive: { backgroundColor: "#3182ce", color: "white", borderColor: "#3182ce" },
  toggleInactive: { backgroundColor: "#f0f0f0", color: "#555", borderColor: "#ddd" },
  visibilityHint: { margin: "0", fontSize: "0.8rem", color: "#888" },
  error: { color: "#e53e3e", fontSize: "0.9rem", margin: "0" },
  submitButton: {
    padding: "0.7rem", backgroundColor: "#3182ce", color: "white",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem",
  },
  tabRow: { display: "flex", gap: "0.5rem", marginBottom: "1rem" },
  tab: {
    padding: "0.5rem 1rem", border: "none", borderRadius: "4px",
    cursor: "pointer", fontSize: "0.9rem", backgroundColor: "#f0f0f0", color: "#555",
  },
  tabActive: { backgroundColor: "#3182ce", color: "white" },
  list: {
    listStyle: "none", padding: "0", margin: "0",
    display: "flex", flexDirection: "column" as const, gap: "0.75rem",
  },
  listItem: {
    padding: "0.75rem", backgroundColor: "#f9f9f9",
    borderRadius: "4px", border: "1px solid #eee",
  },
  planHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  planName: { fontWeight: "bold" as const, fontSize: "1rem" },
  badge: {
    fontSize: "0.75rem", padding: "0.2rem 0.5rem",
    borderRadius: "999px", fontWeight: "bold" as const,
  },
  badgePublic: { backgroundColor: "#c6f6d5", color: "#276749" },
  badgePrivate: { backgroundColor: "#e2e8f0", color: "#4a5568" },
  planDesc: { margin: "0.4rem 0 0", fontSize: "0.9rem", color: "#555" },
  planOwner: { margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#888", fontStyle: "italic" as const },
  planHint: { margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#3182ce" },
  empty: { color: "#888", fontStyle: "italic" as const },
} as const;
