"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    // Prevent the browser from reloading the page on form submit
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Ask Supabase: "Is this email + password combination valid?"
    // If yes, Supabase stores the session (JWT token) automatically.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Login successful – redirect to the dashboard
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Einloggen</h1>
        <p style={styles.subtitle}>Log your Workout 🏋️</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Passwort</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.inputInner}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOn /> : <EyeOff />}
              </button>
            </div>
          </div>

          {/* Show error message if login failed */}
          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Wird geladen..." : "Einloggen"}
          </button>
        </form>

        <p style={styles.footer}>
          Noch kein Konto?{" "}
          <Link href="/auth/register" style={styles.link}>
            Registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}

function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "1rem",
    backgroundColor: "#0a0a0a",
  },
  card: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#ededed",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "#888",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    color: "#aaa",
  },
  input: {
    padding: "0.75rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#ededed",
    fontSize: "1rem",
    outline: "none",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "8px",
    overflow: "hidden",
  },
  inputInner: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#ededed",
    fontSize: "1rem",
    outline: "none",
    minWidth: 0,
  },
  eyeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
    padding: "0 0.75rem",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  button: {
    padding: "0.875rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: {
    color: "#f87171",
    fontSize: "0.875rem",
    backgroundColor: "#1f0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "6px",
    padding: "0.75rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#888",
    fontSize: "0.875rem",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "underline",
  },
};
