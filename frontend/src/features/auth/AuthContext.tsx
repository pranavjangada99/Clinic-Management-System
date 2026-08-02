import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  lastLoginAt: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  requiresSetup: boolean;

  login: (
    username: string,
    password: string,
  ) => Promise<void>;

  setup: (
    username: string,
    displayName: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [requiresSetup, setRequiresSetup] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const refreshUser = async () => {
    const response = await apiFetch("/auth/me");

    if (response.status === 401) {
      setUser(null);
      return;
    }

    if (!response.ok) {
      throw new Error(
        "Unable to verify login.",
      );
    }

    const data: AuthUser =
      await response.json();

    setUser(data);
  };

  useEffect(() => {
    let cancelled = false;

    const initialise = async () => {
      try {
        const setupResponse =
          await apiFetch(
            "/auth/setup-status",
          );

        if (!setupResponse.ok) {
          throw new Error(
            "Unable to check application setup.",
          );
        }

        const setupData: {
          requiresSetup: boolean;
        } = await setupResponse.json();

        if (cancelled) {
          return;
        }

        setRequiresSetup(
          setupData.requiresSetup,
        );

        if (!setupData.requiresSetup) {
          const meResponse =
            await apiFetch("/auth/me");

          if (
            meResponse.ok &&
            !cancelled
          ) {
            const data: AuthUser =
              await meResponse.json();

            setUser(data);
          }
        }
      } catch (error) {
        console.error(
          "Authentication initialisation failed:",
          error,
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initialise();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (
    username: string,
    password: string,
  ) => {
    const response = await apiFetch(
      "/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          username,
          password,
        }),
      },
    );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        cleanApiError(
          message,
          "Invalid username or password.",
        ),
      );
    }

    const data: AuthUser =
      await response.json();

    setUser(data);
    setRequiresSetup(false);
  };

  const setup = async (
    username: string,
    displayName: string,
    password: string,
  ) => {
    const response = await apiFetch(
      "/auth/setup",
      {
        method: "POST",

        body: JSON.stringify({
          username,
          displayName,
          password,
        }),
      },
    );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        cleanApiError(
          message,
          "Unable to create administrator.",
        ),
      );
    }

    const data: AuthUser =
      await response.json();

    setUser(data);
    setRequiresSetup(false);
  };

  const logout = async () => {
    try {
      await apiFetch(
        "/auth/logout",
        {
          method: "POST",
        },
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        requiresSetup,
        login,
        setup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}

function cleanApiError(
  message: string,
  fallback: string,
) {
  if (!message) {
    return fallback;
  }

  try {
    const parsed =
      JSON.parse(message);

    if (
      typeof parsed === "string"
    ) {
      return parsed;
    }

    return (
      parsed.detail ??
      parsed.title ??
      fallback
    );
  } catch {
    return message;
  }
}