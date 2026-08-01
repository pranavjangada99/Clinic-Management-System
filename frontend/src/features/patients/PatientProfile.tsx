import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Edit3,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  bloodGroup: string | null;
  referredBy: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientVisit {
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

  status: "Waiting" | "In Progress" | "Completed";
}

const PATIENTS_API_URL =
  "http://localhost:5230/api/patients";

const VISITS_API_URL =
  "http://localhost:5230/api/visits";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Follow-up": "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function PatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [patientVisits, setPatientVisits] =
    useState<PatientVisit[]>([]);

  const [visitsLoading, setVisitsLoading] =
    useState(true);

  const [visitsError, setVisitsError] =
    useState("");

  /*
   * Load patient
   */
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");
        setNotFound(false);

        const response = await fetch(
          `${PATIENTS_API_URL}/${patientId}`
        );

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load patient."
          );
        }

        const data: Patient =
          await response.json();

        setPatient(data);
      } catch (error) {
        console.error(
          "Failed to load patient:",
          error
        );

        setLoadError(
          "Unable to load this patient. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  /*
   * Load patient's visits
   */
  useEffect(() => {
    const loadVisits = async () => {
      if (!patientId) {
        setVisitsLoading(false);
        return;
      }

      try {
        setVisitsLoading(true);
        setVisitsError("");

        const response =
          await fetch(VISITS_API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to load visit history."
          );
        }

        const data: PatientVisit[] =
          await response.json();

        const matchingVisits = data
          .filter(
            (visit) =>
              visit.patientId ===
              Number(patientId)
          )
          .sort((a, b) => {
            const first = new Date(
              `${a.visitDate}T${a.visitTime}`
            ).getTime();

            const second = new Date(
              `${b.visitDate}T${b.visitTime}`
            ).getTime();

            return second - first;
          });

        setPatientVisits(
          matchingVisits
        );
      } catch (error) {
        console.error(
          "Failed to load visit history:",
          error
        );

        setVisitsError(
          "Unable to load visit history."
        );
      } finally {
        setVisitsLoading(false);
      }
    };

    loadVisits();
  }, [patientId]);

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-900">
          Loading patient...
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Reading the patient record from the clinic database.
        </p>
      </div>
    );
  }

  /*
   * Error
   */
  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <h1 className="text-xl font-semibold text-red-800">
          Unable to load patient
        </h1>

        <p className="mt-2 text-sm text-red-600">
          {loadError}
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/patients")
            }
          >
            Back to Patients
          </AppButton>
        </div>
      </div>
    );
  }

  /*
   * Not found
   */
  if (notFound || !patient) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Patient not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The patient record you're looking for doesn't exist.
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/patients")
            }
          >
            Back to Patients
          </AppButton>
        </div>
      </div>
    );
  }

  /*
   * Patient initials
   */
  const initials = patient.name
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  /*
   * Full address
   */
  const address = [
    patient.address,
    patient.city,
    patient.state,
    patient.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Navigation */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/patients")
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to patients"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm text-slate-500">
              Patients / {patient.uhid}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Patient Profile
            </h1>
          </div>
        </div>

        <AppButton
          variant="secondary"
          onClick={() =>
            navigate(
              `/patients/${patient.id}/edit`
            )
          }
          leftIcon={
            <Edit3 className="h-4 w-4" />
          }
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
                      statusStyles[
                        patient.status
                      ] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {patient.uhid}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {patient.gender} •{" "}
                  {patient.age} years
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <AppButton
                variant="secondary"
                onClick={() =>
                  navigate(
                    `/appointments/add?patientId=${patient.id}`
                  )
                }
                leftIcon={
                  <CalendarDays className="h-4 w-4" />
                }
              >
                New Appointment
              </AppButton>

              <AppButton
                onClick={() =>
                  navigate(
                    `/visits/new?patientId=${patient.id}`
                  )
                }
              >
                Start Consultation
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      {/* Information */}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Patient Details */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Patient Details
              </h2>

              <p className="text-sm text-slate-500">
                Basic registration information
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              label="Full Name"
              value={patient.name}
            />

            <DetailRow
              label="Date of Birth"
              value={formatDate(
                patient.dateOfBirth
              )}
            />

            <DetailRow
              label="Age"
              value={`${patient.age} years`}
            />

            <DetailRow
              label="Gender"
              value={patient.gender}
            />

            <DetailRow
              label="UHID"
              value={patient.uhid}
            />

            <DetailRow
              label="Blood Group"
              value={
                patient.bloodGroup ||
                "Not added"
              }
            />

            <DetailRow
              label="Referred By"
              value={
                patient.referredBy ||
                "Not added"
              }
            />

            <DetailRow
              label="Status"
              value={patient.status}
            />
          </div>
        </section>

        {/* Contact Information */}

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
            {/* Mobile */}

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

            {/* Address */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <MapPin className="h-5 w-5" />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {address ||
                  "Not added"}
              </p>
            </div>

            {/* Alternate Mobile */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Phone className="h-5 w-5" />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Alternate Mobile
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {patient.alternateMobile ||
                  "Not added"}
              </p>
            </div>

            {/* Email */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <UserRound className="h-5 w-5" />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 break-words font-semibold text-slate-900">
                {patient.email ||
                  "Not added"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Visit History */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Visit History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Previous consultations and clinic visits
            </p>
          </div>

          {!visitsLoading &&
            !visitsError && (
              <span className="text-sm text-slate-400">
                {patientVisits.length}{" "}
                {patientVisits.length ===
                1
                  ? "visit"
                  : "visits"}
              </span>
            )}
        </div>

        {/* Loading */}

        {visitsLoading && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-8 text-center">
            <p className="text-sm text-slate-500">
              Loading visit history...
            </p>
          </div>
        )}

        {/* Error */}

        {!visitsLoading &&
          visitsError && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-6 py-6 text-center">
              <p className="text-sm font-medium text-red-700">
                {visitsError}
              </p>
            </div>
          )}

        {/* Real Visit History */}

        {!visitsLoading &&
          !visitsError &&
          patientVisits.length >
            0 && (
            <div className="mt-6 space-y-3">
              {patientVisits.map(
                (visit) => (
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
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CalendarDays className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {formatDate(
                            visit.visitDate
                          )}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            visit.status ===
                            "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : visit.status ===
                                  "In Progress"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {
                            visit.status
                          }
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {visit.chiefComplaints ||
                          "No chief complaint recorded"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(
                          visit.visitTime
                        )}

                        {visit.doctor
                          ? ` • ${visit.doctor}`
                          : ""}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                  </button>
                )
              )}
            </div>
          )}

        {/* No Visits */}

        {!visitsLoading &&
          !visitsError &&
          patientVisits.length ===
            0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">
                No visits yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This patient's
                consultations will appear
                here.
              </p>
            </div>
          )}
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

function formatDate(value: string) {
  if (!value) {
    return "Not added";
  }

  const [year, month, day] =
    value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatTime(value: string) {
  if (!value) {
    return "";
  }

  const [hoursText, minutesText] =
    value.split(":");

  const hours =
    Number(hoursText);

  const minutes =
    Number(minutesText);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
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