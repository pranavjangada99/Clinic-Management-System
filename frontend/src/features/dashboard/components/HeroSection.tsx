import AppButton from "@/components/ui/app/AppButton";
import { dashboardData } from "@/data/dashboard";
import {
  CalendarDays,
  CalendarPlus,
  CreditCard,
  FileText,
  UserPlus,
} from "lucide-react";

const iconColors: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function HeroSection() {
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
              Friday • 31 July 2026
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900">
              Good Evening, {dashboardData.user.name} 👋
            </h1>

            <h2 className="mt-3 text-xl font-semibold text-blue-600">
              {dashboardData.clinic.name}
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
              Everything is running smoothly today.
              <br />
              Welcome back to your clinic dashboard.
            </p>
          </div>

          {/* Actions */}

          <div className="flex flex-wrap gap-3">
            <AppButton leftIcon={<UserPlus className="h-5 w-5" />}>
              Add Patient
            </AppButton>

            <AppButton
              variant="secondary"
              leftIcon={<CalendarPlus className="h-5 w-5" />}
            >
              Appointment
            </AppButton>

            <AppButton
              variant="secondary"
              leftIcon={<CreditCard className="h-5 w-5" />}
            >
              Payment
            </AppButton>

            <AppButton
              variant="secondary"
              leftIcon={<FileText className="h-5 w-5" />}
            >
              Prescription
            </AppButton>
          </div>
        </div>

        {/* Summary */}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboardData.summary.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      iconColors[item.color] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                    Live
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">{item.title}</p>

                <h3 className="mt-1 text-3xl font-bold text-slate-900">
                  {item.value}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}