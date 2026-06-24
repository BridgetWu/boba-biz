import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type GoogleProfile = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: GoogleProfile;
  app_metadata?: Record<string, unknown>;
};

type SupabaseSession = {
  access_token?: string;
  refresh_token?: string;
  user: SupabaseUser;
};

type AuthState = {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  error: string | null;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const SESSION_STORAGE_KEY = "bobabiz.supabase.session";

function getEnvValue(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") {
  return import.meta.env[name] as string | undefined;
}

async function getSupabaseClient() {
  const supabaseUrl = getEnvValue("VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnvValue("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  return createClient(supabaseUrl, supabaseAnonKey) as {
    auth: {
      signInWithIdToken: (args: { provider: "google"; token: string }) => Promise<{ data: { session: SupabaseSession | null }; error: { message: string } | null }>;
      signOut: () => Promise<{ error: { message: string } | null }>;
      getSession: () => Promise<{ data: { session: SupabaseSession | null } }>;
      onAuthStateChange: (callback: (_event: string, session: SupabaseSession | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
    };
  };
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(() => readStoredSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSession(data.session);
        if (typeof window !== "undefined") {
          if (data.session) {
            window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.session));
          } else {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to restore auth session.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    let unsubscribe = () => {};

    void (async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
          if (typeof window !== "undefined") {
            if (nextSession) {
              window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
            } else {
              window.localStorage.removeItem(SESSION_STORAGE_KEY);
            }
          }
        });
        unsubscribe = () => data.subscription.unsubscribe();
      } catch {
        unsubscribe = () => {};
      }
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      error,
      signInWithGoogleCredential: async (credential: string) => {
        setError(null);
        const supabase = await getSupabaseClient();
        const { data, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: credential,
        });

        if (signInError) {
          throw new Error(signInError.message);
        }

        setSession(data.session);
        if (typeof window !== "undefined" && data.session) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.session));
        }
      },
      signOut: async () => {
        setError(null);
        const supabase = await getSupabaseClient();
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          throw new Error(signOutError.message);
        }
        setSession(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      },
    }),
    [error, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
