import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ChevronRight,
  Clock3,
  Search,
  Stethoscope,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { visits } from "./data/visits";
import type { VisitStatus } from "./types";

type Filter = "All" | VisitStatus;

const filters: Filter[] = [
  "All",
  "Waiting",
  "In Progress",
  "Completed",
];

const statusStyles: Record<VisitStatus, string> = {
  Waiting: "bg-amber-50 text-amber-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export default function Visits() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("All");

  const filteredVisits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visits.filter((visit) => {
      const matchesSearch =
        visit.patientName
          .toLowerCase()
          .includes(query) ||
        visit.uhid
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        visit.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const waitingCount = visits.filter(
    (visit) => visit.status === "Waiting"
  ).length;

  const progressCount = visits.filter(
    (visit) =>
      visit.status === "In Progress"
  ).length;

  const completedCount = visits.filter(
    (visit) =>
      visit.status === "Completed"
  ).length;

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
            Manage patient consultations and
            today's clinic visits.
          </p>
        </div>

        <AppButton
          onClick={() =>
            navigate("/visits/new")
          }
          leftIcon={
            <Stethoscope className="h-4 w-4" />
          }
        >
          Start Consultation
        </AppButton>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Visits"
          value={visits.length}
        />

        <SummaryCard
          label="Waiting"
          value={waitingCount}
        />

        <SummaryCard
          label="In Progress"
          value={progressCount}
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
        />
      </div>

      {/* Search */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search patient or UHID..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
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
            onClick={() => {
              if (
                visit.status ===
                "Completed"
              ) {
                navigate(
                  `/visits/${visit.id}`
                );
              } else {
                navigate(
                  `/visits/${visit.id}/consultation`
                );
              }
            }}
            className="group grid w-full grid-cols-[0.8fr_2fr_1.5fr_2fr_1.2fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-0 hover:bg-blue-50/40"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {visit.time}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {visit.patientName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {visit.uhid}
              </p>
            </div>

            <span className="text-sm text-slate-600">
              {visit.doctor}
            </span>

            <span className="truncate text-sm text-slate-600">
              {visit.chiefComplaints ||
                "Not recorded"}
            </span>

            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[
                    visit.status
                  ]
                }`}
              >
                {visit.status}
              </span>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </button>
        ))}
      </div>

      {/* Mobile */}

      <div className="space-y-3 md:hidden">
        {filteredVisits.map((visit) => (
          <button
            key={visit.id}
            type="button"
            onClick={() => {
              if (
                visit.status ===
                "Completed"
              ) {
                navigate(
                  `/visits/${visit.id}`
                );
              } else {
                navigate(
                  `/visits/${visit.id}/consultation`
                );
              }
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {visit.patientName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {visit.uhid}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  statusStyles[
                    visit.status
                  ]
                }`}
              >
                {visit.status}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {visit.time}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {visit.chiefComplaints ||
                "No complaint recorded"}
            </p>
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