import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Loader2,
} from "lucide-react";

import AppCard from "@/components/ui/app/AppCard";

interface Appointment {
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

const API_URL =
  "http://localhost:5230/api/appointments";

const statusColor: Record<
  string,
  string
> = {
  Completed:
    "bg-emerald-100 text-emerald-700",

  "In Progress":
    "bg-blue-100 text-blue-700",

  Waiting:
    "bg-amber-100 text-amber-700",

  Scheduled:
    "bg-slate-100 text-slate-700",

  Cancelled:
    "bg-red-100 text-red-700",
};

export default function ScheduleCard() {
  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async () => {
      try {
        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to load schedule."
          );
        }

        const data: Appointment[] =
          await response.json();

        const today =
          getLocalDateString();

        const todaysAppointments =
          data
            .filter(
              (appointment) =>
                appointment.appointmentDate ===
                today
            )
            .sort((a, b) =>
              a.appointmentTime.localeCompare(
                b.appointmentTime
              )
            );

        if (!cancelled) {
          setAppointments(
            todaysAppointments
          );
        }
      } catch (error) {
        console.error(
          "Failed to load schedule:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load today's schedule."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSchedule();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today's Schedule
          </h2>

          <p className="text-sm text-slate-500">
            Today's consultations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading &&
            !loadError && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {appointments.length}{" "}
                Appointments
              </span>
            )}

          <CalendarDays className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading schedule...
            </p>
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-red-700">
            {loadError}
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-3 font-semibold text-slate-900">
            No appointments today
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Today's schedule is clear.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(
            (appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {
                      appointment.patientName
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatTime(
                      appointment.appointmentTime
                    )}{" "}
                    • {appointment.type}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      appointment.patientUhid
                    }
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusColor[
                      appointment.status
                    ] ??
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </AppCard>
  );
}

function getLocalDateString() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(
  timeString: string
) {
  const [hours, minutes] =
    timeString.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
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