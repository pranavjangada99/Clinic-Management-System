import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Loader2,
} from "lucide-react";

import AppCard from "@/components/ui/app/AppCard";

interface Payment {
  id: number;
  patientName: string;
  amount: number;
  method: string;
  paymentDate: string;
  createdAt: string;
}

interface Visit {
  id: number;
  patientName: string;
  visitDate: string;
  visitTime: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Appointment {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  dateTime: Date;
}

const PAYMENTS_API =
  "http://localhost:5230/api/payments";

const VISITS_API =
  "http://localhost:5230/api/visits";

const APPOINTMENTS_API =
  "http://localhost:5230/api/appointments";

export default function ActivityFeed() {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      try {
        const [
          paymentsResponse,
          visitsResponse,
          appointmentsResponse,
        ] = await Promise.all([
          fetch(PAYMENTS_API),
          fetch(VISITS_API),
          fetch(APPOINTMENTS_API),
        ]);

        if (
          !paymentsResponse.ok ||
          !visitsResponse.ok ||
          !appointmentsResponse.ok
        ) {
          throw new Error(
            "Unable to load activity."
          );
        }

        const payments: Payment[] =
          await paymentsResponse.json();

        const visits: Visit[] =
          await visitsResponse.json();

        const appointments: Appointment[] =
          await appointmentsResponse.json();

        const paymentActivities: ActivityItem[] =
          payments.map((payment) => ({
            id: `payment-${payment.id}`,

            title: "Payment Received",

            subtitle: `${currency(
              payment.amount
            )} • ${payment.patientName} • ${
              payment.method
            }`,

            dateTime: new Date(
              payment.createdAt ||
                payment.paymentDate
            ),
          }));

        const visitActivities: ActivityItem[] =
          visits.map((visit) => ({
            id: `visit-${visit.id}`,

            title:
              visit.status === "Completed"
                ? "Consultation Completed"
                : visit.status ===
                    "Waiting"
                  ? "Patient Waiting"
                  : "Consultation Started",

            subtitle: visit.patientName,

            dateTime: getVisitDateTime(
              visit
            ),
          }));

        const appointmentActivities: ActivityItem[] =
          appointments.map(
            (appointment) => ({
              id: `appointment-${appointment.id}`,

              title:
                "Appointment Scheduled",

              subtitle: `${appointment.patientName} • ${appointment.status}`,

              dateTime:
                getAppointmentDateTime(
                  appointment
                ),
            })
          );

        const combined = [
          ...paymentActivities,
          ...visitActivities,
          ...appointmentActivities,
        ]
          .filter(
            (item) =>
              !Number.isNaN(
                item.dateTime.getTime()
              )
          )
          .sort(
            (a, b) =>
              b.dateTime.getTime() -
              a.dateTime.getTime()
          )
          .slice(0, 6);

        if (!cancelled) {
          setActivities(combined);
        }
      } catch (error) {
        console.error(
          "Failed to load activity:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load recent activity."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Activity Feed
          </h2>

          <p className="text-sm text-slate-500">
            Latest clinic activities
          </p>
        </div>

        <Activity className="h-5 w-5 text-slate-400" />
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading activity...
            </p>
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-red-700">
            {loadError}
          </p>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
          <Activity className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-3 font-semibold text-slate-900">
            No recent activity
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Clinic activity will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map(
            (item, index) => (
              <div
                key={item.id}
                className="relative flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />

                  {index !==
                    activities.length -
                      1 && (
                    <div className="mt-2 h-14 w-px bg-slate-200" />
                  )}
                </div>

                <div className="flex-1 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatActivityTime(
                        item.dateTime
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </AppCard>
  );
}

function getVisitDateTime(
  visit: Visit
) {
  if (visit.updatedAt) {
    return new Date(visit.updatedAt);
  }

  if (visit.createdAt) {
    return new Date(visit.createdAt);
  }

  return new Date(
    `${visit.visitDate}T${visit.visitTime}`
  );
}

function getAppointmentDateTime(
  appointment: Appointment
) {
  if (appointment.createdAt) {
    return new Date(
      appointment.createdAt
    );
  }

  return new Date(
    `${appointment.appointmentDate}T${appointment.appointmentTime}`
  );
}

function formatActivityTime(
  date: Date
) {
  const now = new Date();

  const isToday =
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate();

  if (isToday) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    ).format(date);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
}

function currency(value: number) {
  return `₹${value.toLocaleString(
    "en-IN"
  )}`;
}