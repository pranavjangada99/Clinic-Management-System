import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  Search,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";
import { appointments } from "./data/appointments";
import type { AppointmentStatus } from "./types";

type Filter = "All" | AppointmentStatus;

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

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(query) ||
        appointment.uhid.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || appointment.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

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

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Today"
          value={appointments.length}
        />

        <SummaryCard
          label="Waiting"
          value={
            appointments.filter(
              (appointment) => appointment.status === "Waiting"
            ).length
          }
        />

        <SummaryCard
          label="Scheduled"
          value={
            appointments.filter(
              (appointment) => appointment.status === "Scheduled"
            ).length
          }
        />

        <SummaryCard
          label="Completed"
          value={
            appointments.filter(
              (appointment) => appointment.status === "Completed"
            ).length
          }
        />
      </div>

      {/* Search */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient or UHID..."
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

      {/* Desktop */}

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
            onClick={() =>
              navigate(`/patients/${appointment.patientId}`)
            }
            className="group grid w-full grid-cols-[0.8fr_2fr_1.4fr_1.4fr_1.5fr_1.2fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-0 hover:bg-blue-50/40"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {appointment.time}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {appointment.patientName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {appointment.uhid}
              </p>
            </div>

            <span className="text-sm text-slate-600">
              {appointment.type}
            </span>

            <span className="text-sm text-slate-600">
              {appointment.doctor}
            </span>

            <span className="truncate text-sm text-slate-600">
              {appointment.reason}
            </span>

            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[appointment.status]
                }`}
              >
                {appointment.status}
              </span>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </button>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-900">
              No appointments found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Mobile */}

      <div className="space-y-3 md:hidden">
        {filteredAppointments.map((appointment) => (
          <button
            key={appointment.id}
            type="button"
            onClick={() =>
              navigate(`/patients/${appointment.patientId}`)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-blue-600" />

                  <span className="font-semibold text-slate-900">
                    {appointment.time}
                  </span>
                </div>

                <p className="mt-3 font-semibold text-slate-900">
                  {appointment.patientName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {appointment.uhid}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  statusStyles[appointment.status]
                }`}
              >
                {appointment.status}
              </span>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600">
                {appointment.type}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {appointment.doctor}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}