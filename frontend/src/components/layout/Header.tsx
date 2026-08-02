import { apiFetch } from "@/lib/api";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AppInput from "@/components/ui/app/AppInput";

import {
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";

import {
  useAuth,
} from "@/features/auth/AuthContext";

interface PatientSearchResult {
  id: number;
  uhid: string;
  name: string;
  mobile: string;
}

const PATIENTS_API_URL =
  "/patients";

export default function Header() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    patients,
    setPatients,
  ] =
    useState<
      PatientSearchResult[]
    >([]);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    showSearchResults,
    setShowSearchResults,
  ] = useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const searchRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(
          target
        )
      ) {
        setIsMenuOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          target
        )
      ) {
        setShowSearchResults(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    const query =
      search.trim();

    if (query.length < 2) {
      return;
    }

    let cancelled = false;

    const timer =
      window.setTimeout(
        async () => {
          try {
            setIsSearching(true);

            const response =
              await apiFetch(
                PATIENTS_API_URL
              );

            if (!response.ok) {
              throw new Error(
                "Unable to search patients."
              );
            }

            const data:
              PatientSearchResult[] =
              await response.json();

            if (!cancelled) {
              setPatients(data);
            }
          } catch (error) {
            console.error(
              "Patient search failed:",
              error
            );

            if (!cancelled) {
              setPatients([]);
            }
          } finally {
            if (!cancelled) {
              setIsSearching(
                false
              );
            }
          }
        },
        250
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer
      );
    };
  }, [search]);

  const query =
    search
      .trim()
      .toLowerCase();

  const searchResults =
    query.length >= 2
      ? patients
          .filter(
            (patient) =>
              patient.name
                .toLowerCase()
                .includes(query) ||
              patient.uhid
                .toLowerCase()
                .includes(query) ||
              patient.mobile
                .toLowerCase()
                .includes(query)
          )
          .slice(0, 6)
      : [];

  const openPatient = (
    patientId: number
  ) => {
    setSearch("");

    setShowSearchResults(
      false
    );

    navigate(
      `/patients/${patientId}`
    );
  };

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      try {
        setIsLoggingOut(true);

        await logout();

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      } finally {
        setIsLoggingOut(false);

        setIsMenuOpen(false);
      }
    };

  const now =
    new Date();

  const day =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
      }
    ).format(now);

  const date =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(now);

  const initials =
    getInitials(
      user?.displayName ??
        user?.username ??
        "User"
    );

  return (
    <header className="fixed left-72 right-0 top-0 z-40 bg-slate-50">
      <div className="m-5 flex h-16 items-center justify-between rounded-[24px] border border-slate-200 bg-white px-6 shadow-sm">
        {/* Left */}

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="rounded-xl p-2 transition hover:bg-slate-100"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          {/* Patient Search */}

          <div
            ref={searchRef}
            className="relative w-[340px]"
          >
            <AppInput
              icon
              value={search}
              placeholder="Search name, UHID or mobile..."
              autoComplete="off"
              onFocus={() =>
                setShowSearchResults(
                  true
                )
              }
              onChange={(
                event
              ) => {
                setSearch(
                  event.target.value
                );

                setShowSearchResults(
                  true
                );
              }}
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  searchResults.length >
                    0
                ) {
                  event.preventDefault();

                  openPatient(
                    searchResults[0]
                      .id
                  );
                }

                if (
                  event.key ===
                  "Escape"
                ) {
                  setShowSearchResults(
                    false
                  );
                }
              }}
            />

            {showSearchResults &&
              query.length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Searching...
                    </div>
                  ) : searchResults.length >
                    0 ? (
                    <div className="p-2">
                      {searchResults.map(
                        (
                          patient
                        ) => (
                          <button
                            key={
                              patient.id
                            }
                            type="button"
                            onClick={() =>
                              openPatient(
                                patient.id
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {
                                  patient.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  patient.uhid
                                }
                              </p>
                            </div>

                            <p className="shrink-0 text-xs text-slate-500">
                              {
                                patient.mobile
                              }
                            </p>
                          </button>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No patients
                        found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another
                        name, UHID or
                        mobile number.
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-5">
          {/* Date */}

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {day}
            </p>

            <p className="text-xs text-slate-500">
              {date}
            </p>
          </div>

          {/* Account */}

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (current) =>
                    !current
                )
              }
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:shadow-md"
              aria-expanded={
                isMenuOpen
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-[110px] text-left">
                <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
                  {user?.displayName ??
                    user?.username ??
                    "Clinic User"}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.role ??
                    "User"}
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  isMenuOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.displayName ??
                          "Clinic User"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        @
                        {user?.username ??
                          "user"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(
                      false
                    );

                    navigate(
                      "/settings"
                    );
                  }}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-500" />

                  Settings
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleLogout()
                  }
                  disabled={
                    isLoggingOut
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />

                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getInitials(
  value: string
) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  return words
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase() ??
        ""
    )
    .join("");
}