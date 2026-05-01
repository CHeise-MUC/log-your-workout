"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
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

export default function TrainerClientsPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myPlans, setMyPlans] = useState<Plan[]>([]);
  const [fetching, setFetching] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

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
      fetch("http://localhost:3001/v1/trainer/clients", { headers }).then((r) => {
        if (r.status === 403) throw new Error("not_trainer");
        return r.json();
      }),
      fetch("http://localhost:3001/v1/trainer/assignments", { headers }).then((r) => r.json()),
      fetch("http://localhost:3001/v1/training-plans", { headers }).then((r) => r.json()),
    ])
      .then(([clientsData, assignmentsData, plansData]) => {
        setClients(clientsData);
        setAssignments(assignmentsData);
        setMyPlans(plansData);
        const firstActive = clientsData.find(
          (c: Client) => c.status === "ACTIVE" && c.client,
        );
        if (firstActive?.client) setSelectedClientId(firstActive.client.id);
        if (plansData.length > 0) setSelectedPlanId(plansData[0].id);
      })
      .catch((err) => {
        if (err.message === "not_trainer") router.push("/dashboard");
      })
      .finally(() => setFetching(false));
  }, [session, router]);

  async function handleInviteClient(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch("http://localhost:3001/v1/trainer/clients", {
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
          ? `${data.client?.name ?? data.client?.email} wurde hinzugefügt.`
          : `Einladung an ${inviteEmail} gespeichert.`,
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
      const res = await fetch("http://localhost:3001/v1/trainer/assignments", {
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

  if (loading || fetching) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laden...</p>;
  }

  return (
    <div className="max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          Kunden & Pläne
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          Verwalte deine Kunden und weise Trainingspläne zu.
        </p>
      </div>

      {/* Kunden-Liste */}
      <Section title="Meine Kunden">
        {clients.length === 0 ? (
          <EmptyState text="Noch keine Kunden hinzugefügt." />
        ) : (
          <ul className="flex flex-col gap-2">
            {clients.map((c) => {
              const isActive = c.status === "ACTIVE" && c.client;
              const name = isActive ? (c.client!.name ?? c.client!.email) : c.inviteEmail;
              const email = isActive && c.client!.name ? c.client!.email : "";
              return (
                <li key={c.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? "var(--color-success-light)" : "var(--color-warning-light)",
                      color: isActive ? "var(--color-success-text)" : "var(--color-warning-text)",
                    }}>
                    {isActive ? "✓ Aktiv" : "⏳ Eingeladen"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {name}
                    </p>
                    {email && (
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{email}</p>
                    )}
                  </div>
                  {isActive && (
                    <button
                      onClick={() => router.push(`/trainer/clients/${c.client!.id}`)}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
                      style={{
                        backgroundColor: "transparent",
                        color: "var(--color-accent-text)",
                        border: "1px solid var(--color-accent-light)",
                      }}>
                      Fortschritt <ChevronRight size={12} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Kunde hinzufügen */}
      <Section title="Kunde hinzufügen">
        <form onSubmit={handleInviteClient} className="flex gap-3">
          <input
            type="email"
            placeholder="E-Mail-Adresse des Kunden"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={inviting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#ffffff",
              border: "none",
              opacity: inviting ? 0.7 : 1,
            }}>
            {inviting ? "..." : "Hinzufügen"}
          </button>
        </form>
        {inviteSuccess && (
          <p className="text-sm mt-2" style={{ color: "var(--color-success-text)" }}>{inviteSuccess}</p>
        )}
        {inviteError && (
          <p className="text-sm mt-2" style={{ color: "var(--color-danger-text)" }}>{inviteError}</p>
        )}
      </Section>

      {/* Plan zuweisen */}
      <Section title="Plan zuweisen">
        {activeClients.length === 0 || myPlans.length === 0 ? (
          <EmptyState
            text={activeClients.length === 0
              ? "Füge zuerst einen aktiven Kunden hinzu."
              : "Erstelle zuerst einen Trainingsplan."}
          />
        ) : (
          <>
            <form onSubmit={handleAssignPlan} className="flex gap-3">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}>
                {activeClients.map((c) => (
                  <option key={c.client!.id} value={c.client!.id}>
                    {c.client!.name ?? c.client!.email}
                  </option>
                ))}
              </select>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}>
                {myPlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={assigning}
                className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: "var(--color-success)",
                  color: "#ffffff",
                  border: "none",
                  opacity: assigning ? 0.7 : 1,
                }}>
                {assigning ? "..." : "Zuweisen"}
              </button>
            </form>
            {assignError && (
              <p className="text-sm mt-2" style={{ color: "var(--color-danger-text)" }}>{assignError}</p>
            )}

            {assignments.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--color-text-muted)" }}>
                  Bisherige Zuweisungen
                </p>
                <ul className="flex flex-col gap-2">
                  {assignments.map((a) => (
                    <li key={a.id}
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                      }}>
                      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {a.plan.name}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>→</span>
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {a.client.name ?? a.client.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
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
