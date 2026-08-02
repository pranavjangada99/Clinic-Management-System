import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ChevronRight,
  Clock3,
  Loader2,
  Search,
  Stethoscope,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";
import type { VisitStatus } from "./types";

interface Visit {
  id: number;

  patientId: number;
  patientUhid: string;
  patientName: string;
  patientMobile: string;

  appointmentId: number | null;

  visitDate: string;
  visitTime: string;

  doctor: string;

  chiefComplaints: string;
  symptoms: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;

  advice: string | null;
  followUpDate: string | null;

  status: VisitStatus;
}

type Filter = "All" | VisitStatus;

const API_URL = "/visits";

const filters: Filter[] = ["All", "Waiting", "In Progress", "Completed"];

const statusStyles: Record<VisitStatus, string> = {
  Waiting: "bg-amber-50 text-amber-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export default function Visits() {
  const navigate = useNavigate();

  const [visits, setVisits] = useState<Visit[]>([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<Filter>("All");

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadVisits = async () => {
      try {
        const response = await apiFetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load visits.");
        }

        const data: Visit[] = await response.json();

        if (!cancelled) {
          setVisits(data);
        }
      } catch (error) {
        console.error("Failed to load visits:", error);

        if (!cancelled) {
          setLoadError(
            "Unable to load visits. Make sure the clinic server is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadVisits();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVisits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visits.filter((visit) => {
      const matchesSearch =
        visit.patientName.toLowerCase().includes(query) ||
        visit.patientUhid.toLowerCase().includes(query) ||
        visit.patientMobile.includes(query);

      const matchesFilter = filter === "All" || visit.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [visits, search, filter]);

  const waitingCount = visits.filter(
    (visit) => visit.status === "Waiting",
  ).length;

  const progressCount = visits.filter(
    (visit) => visit.status === "In Progress",
  ).length;

  const completedCount = visits.filter(
    (visit) => visit.status === "Completed",
  ).length;

  const openVisit = (visit: Visit) => {
    if (visit.status === "Completed") {
      navigate(`/visits/${visit.id}`);
      return;
    }

    navigate(`/visits/${visit.id}/consultation`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Activity className="h-4 w-4" />
            Consultation Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Visits
          </h1>

          <p className="mt-2 text-slate-500">
            Manage patient consultations and clinic visits.
          </p>
        </div>

        <AppButton
          onClick={() => navigate("/visits/new")}
          leftIcon={<Stethoscope className="h-4 w-4" />}
        >
          Start Consultation
        </AppButton>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Visits" value={visits.length} />

        <SummaryCard label="Waiting" value={waitingCount} />

        <SummaryCard label="In Progress" value={progressCount} />

        <SummaryCard label="Completed" value={completedCount} />
      </div>

      {/* Search + filters */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, UHID or mobile..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  filter === item
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}

      {isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

          <p className="mt-4 font-semibold text-slate-900">Loading visits...</p>
        </div>
      )}

      {/* Error */}

      {!isLoading && loadError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-700">Unable to load visits</p>

          <p className="mt-2 text-sm text-red-600">{loadError}</p>
        </div>
      )}

      {/* Desktop */}

      {!isLoading && !loadError && (
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="grid grid-cols-[0.8fr_2fr_1.5fr_2fr_1.2fr_40px] gap-4 border-b border-slate-200 bg-slate-50/70 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Time</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Chief Complaint</span>
            <span>Status</span>
            <span />
          </div>

          {filteredVisits.map((visit) => (
            <button
              key={visit.id}
              type="button"
              onClick={() => openVisit(visit)}
              className="group grid w-full grid-cols-[0.8fr_2fr_1.5fr_2fr_1.2fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-0 hover:bg-blue-50/40"
            >
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Clock3 className="h-4 w-4 text-slate-400" />

                {formatTime(visit.visitTime)}
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {visit.patientName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {visit.patientUhid}
                </p>
              </div>

              <span className="text-sm text-slate-600">{visit.doctor}</span>

              <span className="truncate text-sm text-slate-600">
                {visit.chiefComplaints || "Not recorded"}
              </span>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[visit.status]
                  }`}
                >
                  {visit.status}
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
            </button>
          ))}

          {filteredVisits.length === 0 && <EmptyState />}
        </div>
      )}

      {/* Mobile */}

      {!isLoading && !loadError && (
        <div className="space-y-3 md:hidden">
          {filteredVisits.map((visit) => (
            <button
              key={visit.id}
              type="button"
              onClick={() => openVisit(visit)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {visit.patientName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {visit.patientUhid}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[visit.status]
                  }`}
                >
                  {visit.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock3 className="h-4 w-4 text-slate-400" />

                {formatTime(visit.visitTime)}
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {formatDate(visit.visitDate)}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {visit.chiefComplaints || "No complaint recorded"}
              </p>

              <p className="mt-2 text-xs text-slate-400">{visit.doctor}</p>
            </button>
          ))}

          {filteredVisits.length === 0 && <EmptyState />}
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <Stethoscope className="mx-auto h-8 w-8 text-slate-300" />

      <p className="mt-3 font-semibold text-slate-900">No visits found</p>

      <p className="mt-1 text-sm text-slate-500">
        Try changing your search or filter.
      </p>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(timeString: string) {
  const parts = timeString.split(":");

  const hours = Number(parts[0]);

  const minutes = Number(parts[1]);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
