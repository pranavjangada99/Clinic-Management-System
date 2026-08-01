import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";
import { patients } from "./data/patients";
import type { PatientStatus } from "./types";

const statusStyles: Record<PatientStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Follow-up": "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function PatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const patient = patients.find(
    (item) => item.id === Number(patientId)
  );

  if (!patient) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Patient not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The patient record you're looking for doesn't exist.
        </p>

        <div className="mt-6">
          <AppButton onClick={() => navigate("/patients")}>
            Back to Patients
          </AppButton>
        </div>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Navigation */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to patients"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm text-slate-500">Patients / {patient.uhid}</p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Patient Profile
            </h1>
          </div>
        </div>

        <AppButton
          variant="secondary"
          onClick={() => navigate(`/patients/${patient.id}/edit`)}
          leftIcon={<Edit3 className="h-4 w-4" />}
        >
          Edit Patient
        </AppButton>
      </div>

      {/* Patient Hero */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-100">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {patient.name}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[patient.status]
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {patient.uhid}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {patient.gender} • {patient.age} years
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <AppButton
                variant="secondary"
                onClick={() =>
                  navigate(`/appointments/add?patientId=${patient.id}`)
                }
                leftIcon={<CalendarDays className="h-4 w-4" />}
              >
                New Appointment
              </AppButton>

              <AppButton
                onClick={() => navigate(`/visits/new?patientId=${patient.id}`)}
              >
                Start Consultation
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      {/* Information */}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Patient Details</h2>

              <p className="text-sm text-slate-500">
                Basic registration information
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow label="Full Name" value={patient.name} />

            <DetailRow label="Age" value={`${patient.age} years`} />

            <DetailRow label="Gender" value={patient.gender} />

            <DetailRow label="UHID" value={patient.uhid} />

            <DetailRow label="Status" value={patient.status} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Patient contact and location details
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Phone className="h-5 w-5" />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Mobile Number
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {patient.mobile}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <MapPin className="h-5 w-5" />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-1 font-semibold text-slate-900">Not added</p>
            </div>
          </div>
        </section>
      </div>

      {/* Visit History */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Visit History</h2>

            <p className="mt-1 text-sm text-slate-500">
              Previous consultations and clinic visits
            </p>
          </div>

          <span className="text-sm text-slate-400">
            Last visit: {patient.lastVisit}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-3 font-medium text-slate-700">
            Visit history will appear here
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Consultations will be connected in the Visits module.
          </p>
        </div>
      </section>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}