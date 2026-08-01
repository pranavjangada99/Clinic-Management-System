import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  FileText,
  IndianRupee,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AppButton from "@/components/ui/app/AppButton";

interface Visit {
  id: number;
  visitDate: string;
  status: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  type: string;
}

interface Payment {
  id: number;
  paymentDate: string;
  amount: number;
}

interface SummaryItem {
  title: string;
  value: string;
  icon: typeof Users;
  color: string;
}

const VISITS_API =
  "http://localhost:5230/api/visits";

const APPOINTMENTS_API =
  "http://localhost:5230/api/appointments";

const PAYMENTS_API =
  "http://localhost:5230/api/payments";

const iconColors: Record<
  string,
  string
> = {
  blue: "bg-blue-50 text-blue-600",
  amber:
    "bg-amber-50 text-amber-600",
  emerald:
    "bg-emerald-50 text-emerald-600",
  violet:
    "bg-violet-50 text-violet-600",
};

export default function HeroSection() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<SummaryItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [
          visitsResponse,
          appointmentsResponse,
          paymentsResponse,
        ] = await Promise.all([
          fetch(VISITS_API),
          fetch(APPOINTMENTS_API),
          fetch(PAYMENTS_API),
        ]);

        if (
          !visitsResponse.ok ||
          !appointmentsResponse.ok ||
          !paymentsResponse.ok
        ) {
          throw new Error(
            "Unable to load dashboard."
          );
        }

        const visits: Visit[] =
          await visitsResponse.json();

        const appointments: Appointment[] =
          await appointmentsResponse.json();

        const payments: Payment[] =
          await paymentsResponse.json();

        const today =
          getLocalDateString();

        const todaysVisits =
          visits.filter(
            (visit) =>
              visit.visitDate === today
          );

        const patientsToday =
          new Set(
            todaysVisits.map(
              (visit) => visit.id
            )
          ).size;

        const waiting =
          todaysVisits.filter(
            (visit) =>
              visit.status === "Waiting"
          ).length;

        const followUps =
          appointments.filter(
            (appointment) =>
              appointment.appointmentDate ===
                today &&
              appointment.type ===
                "Follow-up"
          ).length;

        const revenue =
          payments
            .filter(
              (payment) =>
                payment.paymentDate.startsWith(today)
            )
            .reduce(
              (sum, payment) =>
                sum + payment.amount,
              0
            );

        const items: SummaryItem[] = [
          {
            title: "Patients Today",
            value: String(
              patientsToday
            ),
            icon: Users,
            color: "blue",
          },
          {
            title: "Waiting",
            value: String(waiting),
            icon: Activity,
            color: "amber",
          },
          {
            title: "Revenue",
            value: currency(revenue),
            icon: IndianRupee,
            color: "emerald",
          },
          {
            title: "Follow-ups",
            value: String(followUps),
            icon: CalendarDays,
            color: "violet",
          },
        ];

        if (!cancelled) {
          setSummary(items);
        }
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load dashboard summary."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentDate =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  const greeting = getGreeting();

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-sm">
      {/* Background Glow */}

      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative">
        {/* Top */}

        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />

              {currentDate}
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900">
              {greeting}, Dr. Pranav 👋
            </h1>

            <h2 className="mt-3 text-xl font-semibold text-blue-600">
              Shree Mahavir
              Homoeopathic Clinic
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
              Everything is running
              smoothly today.
              <br />
              Welcome back to your clinic
              dashboard.
            </p>
          </div>

          {/* Quick Actions */}

          <div className="flex flex-wrap gap-3">
            <AppButton
              onClick={() =>
                navigate(
                  "/patients/add"
                )
              }
              leftIcon={
                <UserPlus className="h-5 w-5" />
              }
            >
              Add Patient
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={() =>
                navigate(
                  "/appointments/add"
                )
              }
              leftIcon={
                <CalendarPlus className="h-5 w-5" />
              }
            >
              Appointment
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={() =>
                navigate(
                  "/payments/new"
                )
              }
              leftIcon={
                <CreditCard className="h-5 w-5" />
              }
            >
              Payment
            </AppButton>

            <AppButton
              variant="secondary"
              onClick={() =>
                navigate("/visits")
              }
              leftIcon={
                <FileText className="h-5 w-5" />
              }
            >
              Prescription
            </AppButton>
          </div>
        </div>

        {/* Summary */}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

              <span className="ml-3 text-sm text-slate-500">
                Loading dashboard...
              </span>
            </div>
          ) : loadError ? (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
              {loadError}
            </div>
          ) : (
            summary.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        iconColors[
                          item.color
                        ] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                      Live
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h3>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
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

function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function currency(value: number) {
  return `₹${value.toLocaleString(
    "en-IN"
  )}`;
}