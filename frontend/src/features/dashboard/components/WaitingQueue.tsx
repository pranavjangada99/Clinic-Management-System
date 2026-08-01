import {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  Loader2,
} from "lucide-react";

import AppCard from "@/components/ui/app/AppCard";

interface WaitingVisit {
  id: number;

  patientId: number;
  patientName: string;
  patientUhid: string;

  visitDate: string;
  visitTime: string;

  doctor: string;
  status: string;
}

const API_URL =
  "http://localhost:5230/api/visits";

export default function WaitingQueue() {
  const [waitingVisits, setWaitingVisits] =
    useState<WaitingVisit[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadWaitingQueue = async () => {
      try {
        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to load waiting queue."
          );
        }

        const data: WaitingVisit[] =
          await response.json();

        const today =
          getLocalDateString();

        const waiting = data
          .filter(
            (visit) =>
              visit.visitDate === today &&
              visit.status === "Waiting"
          )
          .sort((a, b) =>
            a.visitTime.localeCompare(
              b.visitTime
            )
          );

        if (!cancelled) {
          setWaitingVisits(waiting);
        }
      } catch (error) {
        console.error(
          "Failed to load waiting queue:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load waiting queue."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadWaitingQueue();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Waiting Queue
          </h2>

          <p className="text-sm text-slate-500">
            Patients waiting for
            consultation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !loadError && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {waitingVisits.length} Waiting
            </span>
          )}

          <Clock3 className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading waiting queue...
            </p>
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-red-700">
            {loadError}
          </p>
        </div>
      ) : waitingVisits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
          <Clock3 className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-3 font-semibold text-slate-900">
            No patients waiting
          </p>

          <p className="mt-1 text-sm text-slate-500">
            The waiting queue is currently
            clear.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {waitingVisits.map(
            (visit, index) => (
              <div
                key={visit.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {getInitials(
                      visit.patientName
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {visit.patientName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {visit.patientUhid}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {visit.doctor}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Waiting
                  </span>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatTime(
                      visit.visitTime
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Token #{index + 1}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </AppCard>
  );
}

function getLocalDateString() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatTime(
  timeString: string
) {
  const [hours, minutes] =
    timeString.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
}