import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

interface Medicine {
  id: number;
  name: string;
  potency: string | null;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
}

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

  medicines: Medicine[];

  advice: string | null;
  followUpDate: string | null;

  status: "Waiting" | "In Progress" | "Completed";

  createdAt: string;
  updatedAt: string;
}

const API_URL = "/visits";

export default function VisitDetails() {
  const navigate = useNavigate();
  const { visitId } = useParams();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!visitId) {
      return;
    }

    let cancelled = false;

    const loadVisit = async () => {
      try {
        const response = await apiFetch(`${API_URL}/${visitId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Visit not found.");
          }

          throw new Error("Unable to load visit.");
        }

        const data: Visit = await response.json();

        if (!cancelled) {
          setVisit(data);
        }
      } catch (error) {
        console.error("Failed to load visit:", error);

        if (!cancelled) {
          if (error instanceof TypeError) {
            setLoadError(
              "Cannot connect to the clinic server. Make sure the backend is running.",
            );
          } else if (error instanceof Error) {
            setLoadError(error.message);
          } else {
            setLoadError("Unable to load this visit.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadVisit();

    return () => {
      cancelled = true;
    };
  }, [visitId]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

        <p className="mt-4 font-semibold text-slate-900">Loading visit...</p>
      </div>
    );
  }

  if (loadError || !visit) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Visit not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError || "The requested consultation could not be found."}
        </p>

        <div className="mt-6">
          <AppButton onClick={() => navigate("/visits")}>
            Back to Visits
          </AppButton>
        </div>
      </div>
    );
  }

  const formattedDate = formatDate(visit.visitDate);

  const formattedTime = formatTime(visit.visitTime);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/visits")}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to visits"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Stethoscope className="h-4 w-4" />
              Consultation
            </div>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Visit Details
            </h1>

            <p className="mt-1 text-slate-500">
              {formattedDate} • {formattedTime}
            </p>
          </div>
        </div>

        <AppButton
          onClick={() => navigate(`/prescriptions/${visit.id}`)}
          leftIcon={<FileText className="h-4 w-4" />}
        >
          View Prescription
        </AppButton>
      </div>

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <UserRound className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {visit.patientName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">{visit.patientUhid}</p>

              <p className="mt-1 text-sm text-slate-500">
                {visit.patientMobile}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {visit.doctor}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              visit.status === "Completed"
                ? "bg-emerald-50 text-emerald-700"
                : visit.status === "In Progress"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {visit.status}
          </span>
        </div>
      </section>

      {/* Clinical information */}

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard
          icon={<Stethoscope className="h-5 w-5" />}
          title="Chief Complaints"
          value={visit.chiefComplaints || "Not recorded"}
        />

        <InfoCard
          icon={<Stethoscope className="h-5 w-5" />}
          title="Symptoms / Findings"
          value={visit.symptoms || "Not recorded"}
        />

        <InfoCard
          icon={<FileText className="h-5 w-5" />}
          title="Diagnosis / Assessment"
          value={visit.diagnosis || "Not recorded"}
        />

        <InfoCard
          icon={<FileText className="h-5 w-5" />}
          title="Clinical Notes"
          value={visit.clinicalNotes || "Not recorded"}
        />
      </div>

      {/* Medicines */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Pill className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Medicines</h2>

            <p className="text-sm text-slate-500">
              Prescription recorded during this consultation.
            </p>
          </div>
        </div>

        {visit.medicines.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-3">Medicine</th>

                  <th className="pb-3">Potency</th>

                  <th className="pb-3">Dose</th>

                  <th className="pb-3">Frequency</th>

                  <th className="pb-3">Duration</th>

                  <th className="pb-3">Instructions</th>
                </tr>
              </thead>

              <tbody>
                {visit.medicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="border-b border-slate-100 text-sm text-slate-700 last:border-0"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      {medicine.name || "—"}
                    </td>

                    <td className="py-4">{medicine.potency || "—"}</td>

                    <td className="py-4">{medicine.dose || "—"}</td>

                    <td className="py-4">{medicine.frequency || "—"}</td>

                    <td className="py-4">{medicine.duration || "—"}</td>

                    <td className="py-4">{medicine.instructions || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center">
            <Pill className="mx-auto h-6 w-6 text-slate-300" />

            <p className="mt-2 text-sm text-slate-500">
              No medicines recorded for this visit.
            </p>
          </div>
        )}
      </section>

      {/* Advice and follow-up */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Advice & Follow-up</h2>

            <p className="text-sm text-slate-500">
              Instructions and next consultation.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Advice
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
              {visit.advice || "Not recorded"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Follow-up Date
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {visit.followUpDate
                ? formatDate(visit.followUpDate)
                : "Not scheduled"}
            </p>
          </div>
        </div>
      </section>

      {/* Appointment information */}

      {visit.appointmentId && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Appointment</h2>

              <p className="text-sm text-slate-500">
                This visit was created from appointment #{visit.appointmentId}.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bottom actions */}

      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:justify-between">
        <AppButton
          variant="secondary"
          onClick={() => navigate(`/patients/${visit.patientId}`)}
        >
          View Patient
        </AppButton>

        <AppButton
          onClick={() => navigate(`/prescriptions/${visit.id}`)}
          leftIcon={<FileText className="h-4 w-4" />}
        >
          View Prescription
        </AppButton>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function InfoCard({ icon, title, value }: InfoCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>

      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">
        {value}
      </p>
    </section>
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
