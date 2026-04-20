"use client";

// Trainer Dashboard – entry point for the /trainer area.
// Only visible to users with role = TRAINER.
// Shows: client list, option to add clients, plan assignments, and client progress.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Client = {
  id: string;
  status: "ACTIVE" | "PENDING";
  inviteEmail: string | null;
  client: { id: string; name: string | null; email: string } | null;
};

type Assignment = {
  id: string;
  assignedAt: string;
  plan: { id: string; name: string };
  client: { id: string; name: string | null; email: string };
};

type Plan = { id: string; name: string };

export default function TrainerDashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myPlans, setMyPlans] = useState<Plan[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form: add client
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Form: assign plan
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    const headers = { Authorization: `Bearer ${session.access_token}` };

    Promise.all([
      fetch("http://localhost:3001/trainer/clients", { headers }).then((r) => {
        // 403 means this user is not a trainer yet
        if (r.status === 403) throw new Error("not_trainer");
        return r.json();
      }),
      fetch("http://localhost:3001/trainer/assignments", { headers }).then((r) => r.json()),
      fetch("http://localhost:3001/training-plans", { headers }).then((r) => r.json()),
    ])
      .then(([clientsData, assignmentsData, plansData]) => {
        setClients(clientsData);
        setAssignments(assignmentsData);
        setMyPlans(plansData);

        // Pre-select the first active client and first plan for the assign form
        const firstActiveClient = clientsData.find(
          (c: Client) => c.status === "ACTIVE" && c.client,
        );
        if (firstActiveClient?.client) setSelectedClientId(firstActiveClient.client.id);
        if (plansData.length > 0) setSelectedPlanId(plansData[0].id);

        setFetching(false);
      })
      .catch((err) => {
        if (err.message === "not_trainer") {
          // Redirect non-trainers back to the main dashboard
          router.push("/dashboard");
        }
        setFetching(false);
      });
  }, [session, router]);

  async function handleInviteClient(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/trainer/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Fehler");

      setClients((prev) => [data, ...prev]);
      setInviteEmail("");
      setInviteSuccess(
        data.status === "ACTIVE"
          ? `${data.client?.name ?? data.client?.email} wurde als Kunde hinzugefügt.`
          : `Einladung an ${inviteEmail} wurde gespeichert.`,
      );
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setInviting(false);
    }
  }

  async function handleAssignPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token || !selectedClientId || !selectedPlanId) return;

    setAssigning(true);
    setAssignError(null);

    try {
      const res = await fetch("http://localhost:3001/trainer/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId: selectedPlanId, clientId: selectedClientId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Fehler");

      setAssignments((prev) => [data, ...prev]);
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setAssigning(false);
    }
  }

  const activeClients = clients.filter((c) => c.status === "ACTIVE" && c.client);

  if (loading || fetching) return <div style={s.page}><p>Lädt...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <button onClick={() => router.back()} style={s.backLink}>← Zurück</button>
          <h1 style={s.heading}>Trainer-Bereich</h1>
          <p style={s.subtitle}>Verwalte deine Kunden und weise Trainingspläne zu.</p>
        </div>

        {/* Add client */}
        <div style={s.card}>
          <h2 style={s.subheading}>Kunde hinzufügen</h2>
          <form onSubmit={handleInviteClient} style={s.row}>
            <input
              style={{ ...s.input, flex: 1 }}
              type="email"
              placeholder="E-Mail-Adresse des Kunden"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" style={s.btnBlue} disabled={inviting}>
              {inviting ? "..." : "Hinzufügen"}
            </button>
          </form>
          {inviteSuccess && <p style={s.success}>{inviteSuccess}</p>}
          {inviteError && <p style={s.error}>{inviteError}</p>}
        </div>

        {/* Client list – shows all clients (active + pending) in one unified list */}
        <div style={s.card}>
          <h2 style={s.subheading}>Meine Kunden ({clients.length})</h2>
          {clients.length === 0 ? (
            <p style={s.empty}>Noch keine Kunden hinzugefügt.</p>
          ) : (
            <ul style={s.list}>
              {clients.map((c) => {
                const isActive = c.status === "ACTIVE" && c.client;
                const displayName = isActive
                  ? (c.client!.name ?? c.client!.email)
                  : c.inviteEmail;
                const displayEmail = isActive && c.client!.name
                  ? c.client!.email
                  : "";

                return (
                  <li key={c.id} style={s.listItem}>
                    {/* Status badge */}
                    <span style={isActive ? s.badgeActive : s.badgePending}>
                      {isActive ? "✓ Angenommen" : "⏳ Eingeladen"}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={s.clientName}>{displayName}</div>
                      {displayEmail && (
                        <div style={s.clientEmail}>{displayEmail}</div>
                      )}
                    </div>

                    {/* Progress button only for active clients */}
                    {isActive && (
                      <button
                        style={s.btnSmall}
                        onClick={() => router.push(`/trainer/clients/${c.client!.id}`)}
                      >
                        Fortschritt →
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Assign plan */}
        <div style={s.card}>
          <h2 style={s.subheading}>Plan zuweisen</h2>
          {activeClients.length === 0 || myPlans.length === 0 ? (
            <p style={s.empty}>
              {activeClients.length === 0
                ? "Füge zuerst einen Kunden hinzu."
                : "Erstelle zuerst einen Trainingsplan."}
            </p>
          ) : (
            <form onSubmit={handleAssignPlan} style={s.form}>
              <div style={s.row}>
                <select
                  style={{ ...s.input, flex: 1 }}
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  {activeClients.map((c) => (
                    <option key={c.client!.id} value={c.client!.id}>
                      {c.client!.name ?? c.client!.email}
                    </option>
                  ))}
                </select>
                <select
                  style={{ ...s.input, flex: 1 }}
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {myPlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button type="submit" style={s.btnGreen} disabled={assigning}>
                  {assigning ? "..." : "Zuweisen"}
                </button>
              </div>
              {assignError && <p style={s.error}>{assignError}</p>}
            </form>
          )}

          {/* Assignment history */}
          {assignments.length > 0 && (
            <>
              <hr style={s.divider} />
              <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                Bisherige Zuweisungen
              </p>
              <ul style={s.list}>
                {assignments.map((a) => (
                  <li key={a.id} style={s.listItem}>
                    <span style={s.clientName}>{a.plan.name}</span>
                    <span style={s.clientEmail}>
                      → {a.client.name ?? a.client.email}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "sans-serif", padding: "2rem" },
  inner: { maxWidth: "680px", margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  backLink: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.9rem", padding: 0, marginBottom: "0.5rem", display: "block" },
  heading: { margin: "0 0 0.25rem", fontSize: "1.8rem" },
  subtitle: { margin: 0, color: "#666", fontSize: "0.9rem" },
  card: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
  subheading: { margin: "0 0 1rem", fontSize: "1.1rem" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.5rem" },
  row: { display: "flex", gap: "0.75rem", alignItems: "center" },
  input: { padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1rem" },
  btnBlue: { padding: "0.6rem 1.2rem", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem", whiteSpace: "nowrap" as const },
  btnGreen: { padding: "0.6rem 1.2rem", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem", whiteSpace: "nowrap" as const },
  btnSmall: { padding: "0.3rem 0.8rem", backgroundColor: "transparent", color: "#3182ce", border: "1px solid #3182ce", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
  badgeActive: { fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "999px", fontWeight: "bold" as const, backgroundColor: "#c6f6d5", color: "#276749", whiteSpace: "nowrap" as const },
  badgePending: { fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "999px", fontWeight: "bold" as const, backgroundColor: "#fefcbf", color: "#744210", whiteSpace: "nowrap" as const },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: "0.5rem" },
  listItem: { padding: "0.6rem 0.75rem", backgroundColor: "#f9f9f9", borderRadius: "4px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.75rem" },
  clientName: { fontWeight: "bold" as const, fontSize: "0.95rem", flex: 1 },
  clientEmail: { color: "#888", fontSize: "0.8rem", flex: 1 },
  success: { color: "#276749", fontSize: "0.9rem", marginTop: "0.5rem" },
  error: { color: "#e53e3e", fontSize: "0.9rem", marginTop: "0.5rem" },
  empty: { color: "#888", fontStyle: "italic" as const },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "1rem 0" },
} as const;
