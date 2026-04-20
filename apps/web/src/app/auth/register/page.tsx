"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side check: passwords must match before sending to Supabase
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    // signUp creates a new user in Supabase Auth.
    // The "data" object is stored as user_metadata –
    // our AuthGuard in the backend reads it to set the name.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Supabase sends a confirmation email by default.
      // We show a success message and redirect to login.
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Fast geschafft! ✉️</h1>
          <p style={styles.subtitle}>
            Wir haben dir eine Bestätigungsmail geschickt. Bitte bestätige
            deine E-Mail-Adresse, dann kannst du dich einloggen.
          </p>
          <p style={styles.redirect}>Du wirst gleich weitergeleitet...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Registrieren</h1>
        <p style={styles.subtitle}>Log your Workout 🏋️</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Christian"
              required
              style={styles.input}
            />
          </div>

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

          {/* Password with show/hide toggle */}
          <div style={styles.field}>
            <label style={styles.label}>Passwort</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                minLength={6}
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

          {/* Password confirmation with show/hide toggle */}
          <div style={styles.field}>
            <label style={styles.label}>Passwort bestätigen</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Passwort wiederholen"
                minLength={6}
                required
                style={styles.inputInner}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                style={styles.eyeButton}
                aria-label={showPasswordConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPasswordConfirm ? <EyeOn /> : <EyeOff />}
              </button>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Wird registriert..." : "Konto erstellen"}
          </button>
        </form>

        <p style={styles.footer}>
          Bereits ein Konto?{" "}
          <Link href="/auth/login" style={styles.link}>
            Einloggen
          </Link>
        </p>
      </div>
    </main>
  );
}

// ─── Eye icons (inline SVG, no extra package needed) ─────────

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

// ─── Styles ───────────────────────────────────────────────────

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
  // Plain input (name, email)
  input: {
    padding: "0.75rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#ededed",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  // Wrapper for password fields (input + eye button side by side)
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "8px",
    overflow: "hidden",
  },
  // Input inside the wrapper (no border, fills remaining width)
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
  // Eye icon button inside the wrapper
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
  redirect: {
    color: "#555",
    fontSize: "0.875rem",
    marginTop: "1rem",
    textAlign: "center",
  },
};
