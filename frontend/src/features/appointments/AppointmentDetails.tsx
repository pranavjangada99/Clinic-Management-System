import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Phone,
  Play,
  UserRound,
  XCircle,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type {
  Appointment,
  AppointmentStatus,
} from "./types";

const API_URL =
  "/appointments";

const statusStyles: Record<
  AppointmentStatus,
  string
> = {
  Scheduled: "bg-blue-50 text-blue-700",
  Waiting: "bg-amber-50 text-amber-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function AppointmentDetails() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState<AppointmentStatus | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) {
        setLoadError("Invalid appointment.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiFetch(
          `${API_URL}/${appointmentId}`
        );

        if (response.status === 404) {
          setLoadError("Appointment not found.");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load appointment."
          );
        }

        const data: Appointment =
          await response.json();

        setAppointment(data);
      } catch (error) {
        console.error(
          "Failed to load appointment:",
          error
        );

        setLoadError(
          "Unable to load this appointment. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [appointmentId]);

  const updateStatus = async (
    newStatus: AppointmentStatus
  ) => {
    if (!appointment) {
      return null;
    }

    try {
      setUpdatingStatus(newStatus);
      setActionError("");

      const response = await apiFetch(
        `${API_URL}/${appointment.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const message =
          await readApiError(response);

        throw new Error(
          message ||
            "Unable to update appointment."
        );
      }

      const updatedAppointment: Appointment =
        await response.json();

      setAppointment(updatedAppointment);

      return updatedAppointment;
    } catch (error) {
      console.error(
        "Failed to update appointment:",
        error
      );

      if (error instanceof TypeError) {
        setActionError(
          "Cannot connect to the clinic server. Make sure the backend is running."
        );
      } else if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError(
          "Something went wrong while updating the appointment."
        );
      }

      return null;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMarkWaiting = async () => {
    await updateStatus("Waiting");
  };

  const handleStartConsultation = async () => {
    if (!appointment) {
      return;
    }

    /*
      Before opening Consultation, mark the
      appointment as In Progress.

      This keeps the appointment queue and
      consultation workflow synchronized.
    */

    const updated =
      await updateStatus("In Progress");

    if (!updated) {
      return;
    }

    navigate(
      `/visits/new?patientId=${appointment.patientId}&appointmentId=${appointment.id}`
    );
  };

  const handleCancelAppointment = async () => {
    if (!appointment) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel the appointment for ${appointment.patientName}?`
    );

    if (!confirmed) {
      return;
    }

    await updateStatus("Cancelled");
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <CalendarDays className="mx-auto h-8 w-8 animate-pulse text-slate-300" />

        <p className="mt-4 font-semibold text-slate-900">
          Loading appointment...
        </p>
      </div>
    );
  }

  if (loadError || !appointment) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Appointment not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError ||
            "The appointment doesn't exist."}
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/appointments")
            }
          >
            Back to Appointments
          </AppButton>
        </div>
      </div>
    );
  }

  const isUpdating =
    updatingStatus !== null;

  const canMarkWaiting =
    appointment.status === "Scheduled";

  const canStartConsultation =
    appointment.status === "Scheduled" ||
    appointment.status === "Waiting";

  const canCancel =
    appointment.status === "Scheduled" ||
    appointment.status === "Waiting";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/appointments")
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to appointments"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-blue-600">
              Appointment #{appointment.id}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Appointment Details
            </h1>

            <p className="mt-1 text-slate-500">
              View and manage this appointment.
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            statusStyles[appointment.status] ??
            "bg-slate-100 text-slate-600"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Action Error */}

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
              {getInitials(
                appointment.patientName
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600">
                {appointment.patientUhid}
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {appointment.patientName}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-4 w-4" />

                {appointment.patientMobile}
              </div>
            </div>
          </div>

          <AppButton
            variant="secondary"
            onClick={() =>
              navigate(
                `/patients/${appointment.patientId}`
              )
            }
            leftIcon={
              <UserRound className="h-4 w-4" />
            }
          >
            View Patient
          </AppButton>
        </div>
      </section>

      {/* Appointment Information */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Schedule
              </h2>

              <p className="text-sm text-slate-500">
                Appointment date and time
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Date"
              value={formatDate(
                appointment.appointmentDate
              )}
            />

            <InfoRow
              label="Time"
              value={formatTime(
                appointment.appointmentTime
              )}
            />

            <InfoRow
              label="Doctor"
              value={appointment.doctor}
            />

            <InfoRow
              label="Type"
              value={appointment.type}
            />
          </div>
        </section>

        {/* Reason */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Reason / Notes
              </h2>

              <p className="text-sm text-slate-500">
                Appointment information
              </p>
            </div>
          </div>

          {appointment.reason ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {appointment.reason}
            </p>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
              <p className="text-sm text-slate-500">
                No reason or notes added.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Actions */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">
            Appointment Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the patient's queue status or begin
            consultation.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Scheduled -> Waiting */}

          {canMarkWaiting && (
            <AppButton
              variant="secondary"
              disabled={isUpdating}
              onClick={handleMarkWaiting}
              leftIcon={
                updatingStatus === "Waiting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )
              }
            >
              {updatingStatus === "Waiting"
                ? "Updating..."
                : "Mark as Waiting"}
            </AppButton>
          )}

          {/* Start Consultation */}

          {canStartConsultation && (
            <AppButton
              disabled={isUpdating}
              onClick={handleStartConsultation}
              leftIcon={
                updatingStatus === "In Progress" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )
              }
            >
              {updatingStatus === "In Progress"
                ? "Starting..."
                : "Start Consultation"}
            </AppButton>
          )}

          {/* Cancel */}

          {canCancel && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCancelAppointment}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingStatus === "Cancelled" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}

              {updatingStatus === "Cancelled"
                ? "Cancelling..."
                : "Cancel Appointment"}
            </button>
          )}

          <AppButton
            variant="secondary"
            disabled={isUpdating}
            onClick={() =>
              navigate(
                `/patients/${appointment.patientId}`
              )
            }
          >
            Patient Profile
          </AppButton>
        </div>

        {/* Current-state messages */}

        {appointment.status === "Waiting" && (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
            Patient is currently waiting for consultation.
          </div>
        )}

        {appointment.status ===
          "In Progress" && (
          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-medium text-violet-700">
            Consultation is currently in progress.
          </div>
        )}

        {appointment.status ===
          "Completed" && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />

            This appointment has been completed.
          </div>
        )}

        {appointment.status ===
          "Cancelled" && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <XCircle className="h-4 w-4" />

            This appointment has been cancelled.
          </div>
        )}
      </section>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const [year, month, day] =
    value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatTime(value: string) {
  if (!value) {
    return "—";
  }

  const [hourString, minuteString] =
    value.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value;
  }

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
}

async function readApiError(
  response: Response
) {
  try {
    const contentType =
      response.headers.get(
        "content-type"
      );

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      const data =
        await response.json();

      if (typeof data === "string") {
        return data;
      }

      if (data?.title) {
        return data.title;
      }

      if (data?.message) {
        return data.message;
      }

      return "";
    }

    return await response.text();
  } catch {
    return "";
  }
}