import AppCard from "@/components/ui/app/AppCard";
import { dashboardData } from "@/data/dashboard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { IndianRupee, TrendingUp } from "lucide-react";

export default function RevenueCard() {
  const total = dashboardData.revenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  return (
    <AppCard className="p-6">
      {/* Header */}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Revenue Overview
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            ₹{(total / 100000).toFixed(2)}L
          </h2>

          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            +12.8%
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <IndianRupee className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      {/* Chart */}

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dashboardData.revenue}>
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
}