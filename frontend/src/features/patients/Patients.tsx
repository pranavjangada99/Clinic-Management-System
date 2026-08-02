import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronRight,
  Phone,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

type PatientStatus = "Active" | "Follow-up" | "Inactive";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  status: PatientStatus;
}

type Filter = "All" | PatientStatus;

const API_URL = "/patients";

const filters: Filter[] = [
  "All",
  "Active",
  "Follow-up",
  "Inactive",
];

const statusStyles: Record<PatientStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Follow-up": "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiFetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load patients.");
        }

        const data: Patient[] = await response.json();

        setPatients(data);
      } catch (error) {
        console.error("Failed to load patients:", error);

        setLoadError(
          "Unable to load patients. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(query) ||
        patient.mobile.includes(query) ||
        patient.uhid.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || patient.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [patients, search, filter]);

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Users className="h-4 w-4" />
            Patient Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Patients
          </h1>

          <p className="mt-2 text-slate-500">
            Search, manage and view your clinic patients.
          </p>
        </div>

        <AppButton
          onClick={() => navigate("/patients/add")}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add Patient
        </AppButton>
      </div>

      {/* Error */}

      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {loadError}
        </div>
      )}

      {/* Search + Filters */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, mobile or UHID..."
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
                    ? "bg-slate-900 text-white shadow-sm"
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
          <p className="font-semibold text-slate-700">
            Loading patients...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Reading patient records from the clinic database.
          </p>
        </div>
      )}

      {/* Desktop Table */}

      {!isLoading && (
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="grid grid-cols-[1.1fr_2fr_0.7fr_1fr_1.4fr_1.2fr_1fr_40px] gap-4 border-b border-slate-200 bg-slate-50/70 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>UHID</span>
            <span>Patient</span>
            <span>Age</span>
            <span>Gender</span>
            <span>Mobile</span>
            <span>Last Visit</span>
            <span>Status</span>
            <span />
          </div>

          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="group grid w-full grid-cols-[1.1fr_2fr_0.7fr_1fr_1.4fr_1.2fr_1fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-b-0 hover:bg-blue-50/40"
            >
              <span className="text-sm font-medium text-slate-500">
                {patient.uhid}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-100">
                  {getInitials(patient.name)}
                </div>

                <span className="font-semibold text-slate-900">
                  {patient.name}
                </span>
              </div>

              <span className="text-sm text-slate-600">
                {patient.age}
              </span>

              <span className="text-sm text-slate-600">
                {patient.gender}
              </span>

              <span className="text-sm text-slate-600">
                {patient.mobile}
              </span>

              <span className="text-sm text-slate-400">
                No visits yet
              </span>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[patient.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {patient.status}
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500" />
            </button>
          ))}

          {filteredPatients.length === 0 && (
            <EmptyPatients />
          )}
        </div>
      )}

      {/* Mobile Cards */}

      {!isLoading && (
        <div className="space-y-3 md:hidden">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {getInitials(patient.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {patient.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {patient.uhid}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[patient.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {patient.gender} • {patient.age} years
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {patient.mobile}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      No visits yet
                    </p>

                    <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredPatients.length === 0 && (
            <EmptyPatients />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyPatients() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Users className="h-5 w-5 text-slate-400" />
      </div>

      <p className="mt-4 font-semibold text-slate-900">
        No patients found
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Try changing your search or filter.
      </p>
    </div>
  );
}