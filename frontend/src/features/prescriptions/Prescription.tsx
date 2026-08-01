import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, HeartPulse, Loader2, Printer } from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type { PrescriptionClinic } from "./types";

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

const API_URL = "http://localhost:5230/api/visits";

const clinic: PrescriptionClinic = {
  name: "Shree Mahavir Homoeopathic Clinic",
  doctor: "Dr. Pranav",
  qualification: "Homoeopathic Physician",
  address: "Clinic address will be configured in Settings",
  phone: "Clinic contact",
};

export default function Prescription() {
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
        const response = await fetch(`${API_URL}/${visitId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Prescription not found.");
          }

          throw new Error("Unable to load prescription.");
        }

        const data: Visit = await response.json();

        if (!cancelled) {
          setVisit(data);
        }
      } catch (error) {
        console.error("Failed to load prescription:", error);

        if (!cancelled) {
          if (error instanceof TypeError) {
            setLoadError(
              "Cannot connect to the clinic server. Make sure the backend is running.",
            );
          } else if (error instanceof Error) {
            setLoadError(error.message);
          } else {
            setLoadError("Unable to load prescription.");
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

        <p className="mt-4 font-semibold text-slate-900">
          Loading prescription...
        </p>
      </div>
    );
  }

  if (loadError || !visit) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Prescription not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError || "The requested prescription could not be found."}
        </p>

        <div className="mt-6">
          <AppButton onClick={() => navigate("/visits")}>
            Back to Visits
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Controls */}

      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/visits/${visit.id}`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
            aria-label="Back to visit"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Prescription</h1>

            <p className="text-sm text-slate-500">Preview before printing</p>
          </div>
        </div>

        <AppButton
          onClick={() => window.print()}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print Prescription
        </AppButton>
      </div>

      {/* Paper */}

      <article className="min-h-[1000px] bg-white p-8 shadow-sm ring-1 ring-slate-200 print:min-h-0 print:p-0 print:shadow-none print:ring-0 sm:p-12">
        {/* Clinic */}

        <header className="border-b-2 border-slate-900 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white print:border print:border-slate-900 print:bg-white print:text-slate-900">
                <HeartPulse className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {clinic.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">{clinic.address}</p>

                <p className="mt-1 text-sm text-slate-500">{clinic.phone}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900">{clinic.doctor}</p>

              <p className="mt-1 text-sm text-slate-500">
                {clinic.qualification}
              </p>
            </div>
          </div>
        </header>

        {/* Patient */}

        <section className="grid gap-4 border-b border-slate-200 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Patient
            </p>

            <p className="mt-1 font-bold text-slate-900">{visit.patientName}</p>

            <p className="mt-1 text-sm text-slate-500">{visit.patientUhid}</p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Date
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(visit.visitDate)}
            </p>
          </div>
        </section>

        {/* Complaint */}

        {visit.chiefComplaints && (
          <section className="py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Chief Complaints
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {visit.chiefComplaints}
            </p>
          </section>
        )}

        {/* RX */}

        <section className="py-4">
          <div className="mb-5 text-3xl font-bold italic text-slate-900">℞</div>

          {visit.medicines.length > 0 ? (
            <div className="space-y-5">
              {visit.medicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="border-b border-slate-100 pb-5 last:border-0"
                >
                  <div className="flex gap-3">
                    <span className="font-semibold text-slate-400">
                      {index + 1}.
                    </span>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="font-bold text-slate-900">
                          {medicine.name}
                        </p>

                        {medicine.potency && (
                          <span className="text-sm font-semibold text-slate-600">
                            {medicine.potency}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        {[medicine.dose, medicine.frequency, medicine.duration]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>

                      {medicine.instructions && (
                        <p className="mt-1 text-sm italic text-slate-500">
                          {medicine.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No medicines prescribed.</p>
          )}
        </section>

        {/* Advice */}

        {visit.advice && (
          <section className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Advice
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {visit.advice}
            </p>
          </section>
        )}

        {/* Follow-up */}

        {visit.followUpDate && (
          <section className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Follow-up
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {formatDate(visit.followUpDate)}
            </p>
          </section>
        )}

        {/* Signature */}

        <footer className="mt-20 flex justify-end">
          <div className="min-w-[220px] border-t border-slate-400 pt-3 text-center">
            <p className="font-semibold text-slate-900">{clinic.doctor}</p>

            <p className="mt-1 text-xs text-slate-500">Doctor's Signature</p>
          </div>
        </footer>
      </article>
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
