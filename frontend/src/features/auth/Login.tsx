import {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

export default function Login() {
  const {
    user,
    isLoading,
    requiresSetup,
    login,
    setup,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [username, setUsername] =
    useState("");

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");

      if (
        !username.trim() ||
        !password
      ) {
        setError(
          "Username and password are required."
        );

        return;
      }

      if (requiresSetup) {
        if (
          !displayName.trim()
        ) {
          setError(
            "Display name is required."
          );

          return;
        }

        if (
          password !==
          confirmPassword
        ) {
          setError(
            "Passwords do not match."
          );

          return;
        }
      }

      try {
        setIsSubmitting(true);

        if (requiresSetup) {
          await setup(
            username.trim(),
            displayName.trim(),
            password
          );
        } else {
          await login(
            username.trim(),
            password
          );
        }

        const from =
          (
            location.state as
              | {
                  from?: {
                    pathname?: string;
                  };
                }
              | null
          )?.from?.pathname ??
          "/";

        navigate(
          from,
          {
            replace: true,
          }
        );
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to continue."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
              <Stethoscope className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold">
                Shree Mahavir
              </p>

              <p className="text-sm text-slate-400">
                Homoeopathic Clinic
              </p>
            </div>
          </div>

          <div className="max-w-lg">
            <ShieldCheck className="h-12 w-12 text-blue-400" />

            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Secure clinic
              management.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Patient records,
              consultations, billing
              and clinic information
              remain protected behind
              your clinic account.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Clinic Management System
          </p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Stethoscope className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-8 text-sm font-semibold text-blue-600 lg:mt-0">
              {requiresSetup
                ? "FIRST-TIME SETUP"
                : "WELCOME BACK"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {requiresSetup
                ? "Create administrator"
                : "Sign in"}
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              {requiresSetup
                ? "Create the administrator account for this clinic installation."
                : "Enter your clinic account credentials to continue."}
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-5"
            >
              {requiresSetup && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Display Name
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={
                        displayName
                      }
                      onChange={(
                        event
                      ) =>
                        setDisplayName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Dr. Pranav"
                      autoComplete="name"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={username}
                    onChange={(
                      event
                    ) =>
                      setUsername(
                        event.target
                          .value
                      )
                    }
                    placeholder="admin"
                    autoComplete="username"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete={
                      requiresSetup
                        ? "new-password"
                        : "current-password"
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {requiresSetup && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Minimum 8
                    characters with an
                    uppercase letter,
                    lowercase letter
                    and number.
                  </p>
                )}
              </div>

              {requiresSetup && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : requiresSetup
                    ? "Create Administrator"
                    : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}