import AppCard from "@/components/ui/app/AppCard";
import { dashboardData } from "@/data/dashboard";
import { Clock3 } from "lucide-react";

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function WaitingQueue() {
  return (
    <AppCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Waiting Queue
          </h2>

          <p className="text-sm text-slate-500">
            Patients waiting for consultation
          </p>
        </div>

        <Clock3 className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {dashboardData.waitingQueue.map((patient, index) => (
          <div
            key={patient.id}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  {patient.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {patient.room}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  priorityStyles[patient.priority]
                }`}
              >
                {patient.priority}
              </span>

              <p className="mt-2 text-sm text-slate-500">
                Waiting {patient.waiting}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Token #{index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}