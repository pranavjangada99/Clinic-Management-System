import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Save,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type { AppointmentStatus, AppointmentType } from "./types";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  mobile: string;
  status: string;
}

interface AppointmentForm {
  patientId: string;
  date: string;
  time: string;
  type: AppointmentType;
  doctor: string;
  reason: string;
  status: AppointmentStatus;
}

interface CreatedAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientUhid: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  doctor: string;
  reason: string | null;
  status: string;
}

const PATIENTS_API_URL = "/patients";

const APPOINTMENTS_API_URL = "/appointments";

const SETTINGS_API_URL = "/clinic-settings";

export default function AddAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedPatientId = searchParams.get("patientId") ?? "";

  const [patients, setPatients] = useState<Patient[]>([]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [patientLoadError, setPatientLoadError] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");

  const today = useMemo(() => getLocalDateString(), []);

  const [form, setForm] = useState<AppointmentForm>({
    patientId: "",
    date: today,
    time: "",
    type: "New Consultation",
    doctor: "",
    reason: "",
    status: "Scheduled",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /*
    Load real patients from the database.
  */

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoadingPatients(true);
        setPatientLoadError("");

        const [patientsResponse, settingsResponse] = await Promise.all([
          apiFetch(PATIENTS_API_URL),
          apiFetch(SETTINGS_API_URL),
        ]);

        if (!patientsResponse.ok) {
          throw new Error("Unable to load patients.");
        }

        const data: Patient[] = await patientsResponse.json();

        setPatients(data);

        if (settingsResponse.ok) {
          const settings: { doctorName?: string } =
            await settingsResponse.json();

          if (settings.doctorName?.trim()) {
            setForm((current) => ({
              ...current,
              doctor: settings.doctorName!.trim(),
            }));
          }
        }

        if (requestedPatientId) {
          const patientExists = data.some(
            (patient) => String(patient.id) === requestedPatientId,
          );

          if (patientExists) {
            setForm((current) => ({
              ...current,
              patientId: requestedPatientId,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load patients:", error);

        setPatientLoadError(
          "Unable to load patients. Make sure the clinic server is running.",
        );
      } finally {
        setIsLoadingPatients(false);
      }
    };

    loadPatients();
  }, [requestedPatientId]);

  /*
    If we came here from Patient Profile using:

    /appointments/add?patientId=5

    automatically select that patient after
    the real patient list has loaded.
  */

  const updateField = (field: keyof AppointmentForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }

    if (saveError) {
      setSaveError("");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.patientId) {
      newErrors.patientId = "Please select a patient.";
    }

    if (!form.date) {
      newErrors.date = "Appointment date is required.";
    } else if (form.date < today) {
      newErrors.date = "Appointment date cannot be in the past.";
    }

    if (!form.time) {
      newErrors.time = "Appointment time is required.";
    }

    if (!form.type) {
      newErrors.type = "Appointment type is required.";
    }

    if (!form.doctor.trim()) {
      newErrors.doctor = "Doctor is required.";
    }

    if (!form.status) {
      newErrors.status = "Appointment status is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      const response = await apiFetch(APPOINTMENTS_API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          patientId: Number(form.patientId),

          appointmentDate: form.date,

          appointmentTime: form.time,

          type: form.type,

          doctor: form.doctor.trim(),

          reason: form.reason.trim() || null,

          status: form.status,
        }),
      });

      if (!response.ok) {
        let message = "Unable to save appointment.";

        try {
          const errorData = await response.json();

          if (typeof errorData === "string") {
            message = errorData;
          } else if (errorData?.title) {
            message = errorData.title;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const appointment: CreatedAppointment = await response.json();

      console.log("Appointment saved:", appointment);

      navigate("/appointments");
    } catch (error) {
      console.error("Failed to save appointment:", error);

      if (error instanceof TypeError) {
        setSaveError(
          "Cannot connect to the clinic server. Make sure the backend is running.",
        );
      } else if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Something went wrong while saving the appointment.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to appointments"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              New Appointment
            </h1>

            <p className="mt-1 text-slate-500">
              Schedule a patient consultation.
            </p>
          </div>
        </div>

        <div className="hidden gap-3 sm:flex">
          <AppButton
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={() => navigate("/appointments")}
          >
            Cancel
          </AppButton>

          <AppButton
            type="submit"
            disabled={isSaving || isLoadingPatients}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isSaving ? "Saving..." : "Save Appointment"}
          </AppButton>
        </div>
      </div>

      {/* API Error */}

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<UserRound className="h-5 w-5" />}
          title="Patient"
          description="Select the patient for this appointment."
        />

        <div className="mt-6">
          <label className={labelClass}>
            Patient <span className="text-red-500">*</span>
          </label>

          {patientLoadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {patientLoadError}
            </div>
          ) : (
            <select
              value={form.patientId}
              disabled={isLoadingPatients}
              onChange={(event) => updateField("patientId", event.target.value)}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
            >
              <option value="">
                {isLoadingPatients ? "Loading patients..." : "Select patient"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — {patient.uhid} — {patient.mobile}
                </option>
              ))}
            </select>
          )}

          {errors.patientId && (
            <p className="mt-2 text-xs text-red-600">{errors.patientId}</p>
          )}

          {!isLoadingPatients && !patientLoadError && patients.length === 0 && (
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No patients are available. Add a patient before scheduling an
              appointment.
            </div>
          )}
        </div>
      </section>

      {/* Schedule */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<CalendarDays className="h-5 w-5" />}
          title="Schedule"
          description="Choose the appointment date and time."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Date */}

          <div>
            <label className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className={inputClass}
            />

            {errors.date && (
              <p className="mt-2 text-xs text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Time */}

          <div>
            <label className={labelClass}>
              Time <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="time"
                value={form.time}
                onChange={(event) => updateField("time", event.target.value)}
                className={`${inputClass} pl-11`}
              />
            </div>

            {errors.time && (
              <p className="mt-2 text-xs text-red-600">{errors.time}</p>
            )}
          </div>
        </div>
      </section>

      {/* Appointment Details */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<FileText className="h-5 w-5" />}
          title="Appointment Details"
          description="Specify the consultation details."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Type */}

          <div>
            <label className={labelClass}>Appointment Type</label>

            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className={inputClass}
            >
              <option value="New Consultation">New Consultation</option>

              <option value="Follow-up">Follow-up</option>

              <option value="Review">Review</option>
            </select>
          </div>

          {/* Doctor */}

          <div>
            <label className={labelClass}>Doctor</label>

            <select
              value={form.doctor}
              onChange={(event) => updateField("doctor", event.target.value)}
              className={inputClass}
            >
              {form.doctor ? (
                <option value={form.doctor}>{form.doctor}</option>
              ) : (
                <option value="" disabled>
                  Doctor not configured
                </option>
              )}
            </select>
          </div>

          {/* Reason */}

          <div className="md:col-span-2">
            <label className={labelClass}>Reason / Notes</label>

            <textarea
              value={form.reason}
              onChange={(event) => updateField("reason", event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Reason for appointment or additional notes..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* Status */}

          <div>
            <label className={labelClass}>Status</label>

            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className={inputClass}
            >
              <option value="Scheduled">Scheduled</option>

              <option value="Waiting">Waiting</option>

              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>
      </section>

      {/* Mobile Actions */}

      <div className="grid grid-cols-2 gap-3 pb-4 sm:hidden">
        <AppButton
          type="button"
          variant="secondary"
          disabled={isSaving}
          onClick={() => navigate("/appointments")}
        >
          Cancel
        </AppButton>

        <AppButton
          type="submit"
          disabled={isSaving || isLoadingPatients}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {isSaving ? "Saving..." : "Save"}
        </AppButton>
      </div>
    </form>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>

        <p className="text-sm text-slate-500">{description}</p>
      </div>
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
