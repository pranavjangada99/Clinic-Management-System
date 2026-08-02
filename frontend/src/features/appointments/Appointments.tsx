import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";
import type { AppointmentStatus } from "./types";

interface Appointment {
  id: number;
  patientId: number;
  patientUhid: string;
  patientName: string;
  patientMobile: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  doctor: string;
  reason: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

type Filter = "All" | AppointmentStatus;

const API_URL = "/appointments";

const filters: Filter[] = [
  "All",
  "Scheduled",
  "Waiting",
  "In Progress",
  "Completed",
  "Cancelled",
];

const statusStyles: Record<AppointmentStatus, string> = {
  Scheduled: "bg-blue-50 text-blue-700",
  Waiting: "bg-amber-50 text-amber-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const today = useMemo(() => getLocalDateString(), []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await apiFetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load appointments.");
      }

      const data: Appointment[] = await response.json();

      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);

      setLoadError(
        "Unable to load appointments. Make sure the clinic server is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchAppointments = async () => {
      try {
        const response = await apiFetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load appointments.");
        }

        const data: Appointment[] = await response.json();

        if (!cancelled) {
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);

        if (!cancelled) {
          setLoadError(
            "Unable to load appointments. Make sure the clinic server is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
    This screen is currently the "Today's Appointments" screen.

    The API can return appointments for all dates, but here we only
    display today's records.

    Later we can add:
    - Previous / Next day
    - Calendar
    - Date range
    - Upcoming appointments
  */

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.appointmentDate === today)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [appointments, today]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return todaysAppointments.filter((appointment) => {
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(query) ||
        appointment.patientUhid.toLowerCase().includes(query) ||
        appointment.patientMobile.includes(query);

      const matchesFilter = filter === "All" || appointment.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [todaysAppointments, search, filter]);

  const waitingCount = todaysAppointments.filter(
    (appointment) => appointment.status === "Waiting",
  ).length;

  const scheduledCount = todaysAppointments.filter(
    (appointment) => appointment.status === "Scheduled",
  ).length;

  const completedCount = todaysAppointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <CalendarDays className="h-4 w-4" />
            Appointment Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Appointments
          </h1>

          <p className="mt-2 text-slate-500">
            Manage today's clinic appointments and patient schedule.
          </p>
        </div>

        <AppButton
          onClick={() => navigate("/appointments/add")}
          leftIcon={<CalendarPlus className="h-4 w-4" />}
        >
          New Appointment
        </AppButton>
      </div>

      {/* Load Error */}

      {loadError && (
        <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-red-700">
              Unable to load appointments
            </p>

            <p className="mt-1 text-sm text-red-600">{loadError}</p>
          </div>

          <button
            type="button"
            onClick={loadAppointments}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Today" value={todaysAppointments.length} />

        <SummaryCard label="Waiting" value={waitingCount} />

        <SummaryCard label="Scheduled" value={scheduledCount} />

        <SummaryCard label="Completed" value={completedCount} />
      </div>

      {/* Search + Filters */}

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
          <CalendarDays className="mx-auto h-8 w-8 animate-pulse text-slate-300" />

          <p className="mt-4 font-semibold text-slate-900">
            Loading appointments...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Reading today's schedule from the clinic database.
          </p>
        </div>
      )}

      {/* Desktop */}

      {!isLoading && !loadError && (
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="grid grid-cols-[0.8fr_2fr_1.4fr_1.4fr_1.5fr_1.2fr_40px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Time</span>
            <span>Patient</span>
            <span>Type</span>
            <span>Doctor</span>
            <span>Reason</span>
            <span>Status</span>
            <span />
          </div>

          {filteredAppointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => navigate(`/appointments/${appointment.id}`)}
              className="group grid w-full grid-cols-[0.8fr_2fr_1.4fr_1.4fr_1.5fr_1.2fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-0 hover:bg-blue-50/40"
            >
              {/* Time */}

              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Clock3 className="h-4 w-4 text-slate-400" />

                {formatTime(appointment.appointmentTime)}
              </div>

              {/* Patient */}

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {appointment.patientName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {appointment.patientUhid}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {appointment.patientMobile}
                </p>
              </div>

              {/* Type */}

              <span className="text-sm text-slate-600">{appointment.type}</span>

              {/* Doctor */}

              <span className="text-sm text-slate-600">
                {appointment.doctor}
              </span>

              {/* Reason */}

              <span
                className="truncate text-sm text-slate-600"
                title={appointment.reason ?? ""}
              >
                {appointment.reason || "—"}
              </span>

              {/* Status */}

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[appointment.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
            </button>
          ))}

          {filteredAppointments.length === 0 && (
            <EmptyAppointments
              hasAppointments={todaysAppointments.length > 0}
            />
          )}
        </div>
      )}

      {/* Mobile */}

      {!isLoading && !loadError && (
        <div className="space-y-3 md:hidden">
          {filteredAppointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => navigate(`/appointments/${appointment.id}`)}
              className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0 text-blue-600" />

                    <span className="font-semibold text-slate-900">
                      {formatTime(appointment.appointmentTime)}
                    </span>
                  </div>

                  <p className="mt-3 truncate font-semibold text-slate-900">
                    {appointment.patientName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {appointment.patientUhid}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {appointment.patientMobile}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[appointment.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {appointment.type}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.doctor}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1" />
                </div>

                {appointment.reason && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                    {appointment.reason}
                  </p>
                )}
              </div>
            </button>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-900">
                No appointments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {todaysAppointments.length === 0
                  ? "There are no appointments scheduled for today."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          )}
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

interface EmptyAppointmentsProps {
  hasAppointments: boolean;
}

function EmptyAppointments({ hasAppointments }: EmptyAppointmentsProps) {
  return (
    <div className="px-6 py-16 text-center">
      <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

      <p className="mt-3 font-semibold text-slate-900">No appointments found</p>

      <p className="mt-1 text-sm text-slate-500">
        {hasAppointments
          ? "Try changing your search or status filter."
          : "There are no appointments scheduled for today."}
      </p>
    </div>
  );
}

function getLocalDateString() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(value: string) {
  if (!value) {
    return "";
  }

  const [hourString, minuteString] = value.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}
