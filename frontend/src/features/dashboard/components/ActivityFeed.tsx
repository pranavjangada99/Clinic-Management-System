import AppCard from "@/components/ui/app/AppCard";
import { dashboardData } from "@/data/dashboard";
import { Activity } from "lucide-react";

export default function ActivityFeed() {
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

      <div className="space-y-6">
        {dashboardData.activity.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-blue-600" />

              {index !== dashboardData.activity.length - 1 && (
                <div className="mt-2 h-14 w-px bg-slate-200" />
              )}
            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-900">
                  {item.title}
                </h3>

                <span className="shrink-0 text-xs text-slate-400">
                  {item.time}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}