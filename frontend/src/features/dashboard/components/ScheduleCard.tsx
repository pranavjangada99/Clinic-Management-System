import AppCard from "@/components/ui/app/AppCard";
import { dashboardData } from "@/data/dashboard";
import { CalendarDays } from "lucide-react";

const statusColor: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Upcoming: "bg-slate-100 text-slate-700",
};

export default function ScheduleCard() {
  return (
    <AppCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today's Schedule
          </h2>

          <p className="text-sm text-slate-500">
            Upcoming consultations
          </p>
        </div>

        <CalendarDays className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {dashboardData.schedule.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {appointment.patient}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {appointment.time} • {appointment.type}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColor[appointment.status]
              }`}
            >
              {appointment.status}
            </span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}