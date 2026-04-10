"use client";

// 'use client' means this component runs in the browser, not on the server.
// This is needed because we use React hooks (useState, useEffect)
// and listen to real-time auth state changes.

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Define the shape of our auth context:
// What data and functions does it provide to the rest of the app?
type AuthContextType = {
  user: User | null; // the logged-in user (or null if not logged in)
  session: Session | null; // the full session including the JWT token
  loading: boolean; // true while we're checking if someone is logged in
};

// Create the context with default values.
// These defaults are used before the Provider loads.
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

// AuthProvider wraps the entire app (see layout.tsx).
// It listens for login/logout events and updates state accordingly.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On first load: check if there's already an active session
    // (e.g. the user was logged in before and refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth events: LOGIN, LOGOUT, TOKEN_REFRESHED etc.
    // This keeps our state in sync whenever auth changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup: unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook – instead of writing useContext(AuthContext) everywhere,
// any component can simply call: const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);
