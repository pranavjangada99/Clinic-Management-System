import { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Save,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";
import { patients } from "@/features/patients/data/patients";

import type {
  AppointmentStatus,
  AppointmentType,
} from "./types";

interface AppointmentForm {
  patientId: string;
  date: string;
  time: string;
  type: AppointmentType;
  doctor: string;
  reason: string;
  status: AppointmentStatus;
}

export default function AddAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedPatientId =
    searchParams.get("patientId") ?? "";

  const validPatientId = useMemo(() => {
    const exists = patients.some(
      (patient) =>
        String(patient.id) === requestedPatientId
    );

    return exists ? requestedPatientId : "";
  }, [requestedPatientId]);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [form, setForm] =
    useState<AppointmentForm>({
      patientId: validPatientId,
      date: today,
      time: "",
      type: "New Consultation",
      doctor: "Dr. Pranav",
      reason: "",
      status: "Scheduled",
    });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const updateField = (
    field: keyof AppointmentForm,
    value: string
  ) => {
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
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.patientId) {
      newErrors.patientId =
        "Please select a patient.";
    }

    if (!form.date) {
      newErrors.date =
        "Appointment date is required.";
    }

    if (!form.time) {
      newErrors.time =
        "Appointment time is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const selectedPatient = patients.find(
      (patient) =>
        String(patient.id) === form.patientId
    );

    console.log("Appointment ready to save:", {
      ...form,
      patient: selectedPatient,
    });

    /*
      Actual persistence will be connected
      through the .NET API/database.
    */

    navigate("/appointments");
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
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
            onClick={() => navigate("/appointments")}
          >
            Cancel
          </AppButton>

          <AppButton
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Appointment
          </AppButton>
        </div>
      </div>

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<UserRound className="h-5 w-5" />}
          title="Patient"
          description="Select the patient for this appointment."
        />

        <div className="mt-6">
          <label className={labelClass}>
            Patient{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            value={form.patientId}
            onChange={(event) =>
              updateField(
                "patientId",
                event.target.value
              )
            }
            className={inputClass}
          >
            <option value="">
              Select patient
            </option>

            {patients.map((patient) => (
              <option
                key={patient.id}
                value={patient.id}
              >
                {patient.name} — {patient.uhid}
              </option>
            ))}
          </select>

          {errors.patientId && (
            <p className="mt-2 text-xs text-red-600">
              {errors.patientId}
            </p>
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
          <div>
            <label className={labelClass}>
              Date{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(event) =>
                updateField(
                  "date",
                  event.target.value
                )
              }
              className={inputClass}
            />

            {errors.date && (
              <p className="mt-2 text-xs text-red-600">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Time{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Clock3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="time"
                value={form.time}
                onChange={(event) =>
                  updateField(
                    "time",
                    event.target.value
                  )
                }
                className={`${inputClass} pl-11`}
              />
            </div>

            {errors.time && (
              <p className="mt-2 text-xs text-red-600">
                {errors.time}
              </p>
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
          <div>
            <label className={labelClass}>
              Appointment Type
            </label>

            <select
              value={form.type}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="New Consultation">
                New Consultation
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Review">
                Review
              </option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Doctor
            </label>

            <select
              value={form.doctor}
              onChange={(event) =>
                updateField(
                  "doctor",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="Dr. Pranav">
                Dr. Pranav
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Reason / Notes
            </label>

            <textarea
              value={form.reason}
              onChange={(event) =>
                updateField(
                  "reason",
                  event.target.value
                )
              }
              rows={4}
              placeholder="Reason for appointment or additional notes..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className={labelClass}>
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Waiting">
                Waiting
              </option>

              <option value="In Progress">
                In Progress
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Mobile */}

      <div className="grid grid-cols-2 gap-3 pb-4 sm:hidden">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => navigate("/appointments")}
        >
          Cancel
        </AppButton>

        <AppButton
          type="submit"
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save
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

function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}