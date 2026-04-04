export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Log your Workout 🏋️
      </h1>
      <p style={{ color: "#888", fontSize: "1.1rem", textAlign: "center" }}>
        Track your training sessions, sets, reps, and weights.
      </p>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>
        🚧 Under construction – Sprint 1 in progress
      </p>
    </main>
  );
}
