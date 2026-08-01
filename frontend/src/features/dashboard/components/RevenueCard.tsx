import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  IndianRupee,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import AppCard from "@/components/ui/app/AppCard";

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
}

interface RevenueDay {
  date: string;
  day: string;
  revenue: number;
}

const API_URL =
  "http://localhost:5230/api/payments";

export default function RevenueCard() {
  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPayments = async () => {
      try {
        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to load revenue."
          );
        }

        const data: Payment[] =
          await response.json();

        if (!cancelled) {
          setPayments(data);
        }
      } catch (error) {
        console.error(
          "Failed to load revenue:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load revenue."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  const revenueData =
    useMemo<RevenueDay[]>(() => {
      const days: RevenueDay[] = [];

      for (let offset = 6; offset >= 0; offset--) {
        const date = new Date();

        date.setHours(0, 0, 0, 0);
        date.setDate(
          date.getDate() - offset
        );

        const dateString =
          toLocalDateString(date);

        const revenue = payments
          .filter((payment) =>
            payment.paymentDate.startsWith(
              dateString
            )
          )
          .reduce(
            (sum, payment) =>
              sum + payment.amount,
            0
          );

        days.push({
          date: dateString,
          day: new Intl.DateTimeFormat(
            "en-IN",
            {
              weekday: "short",
            }
          ).format(date),
          revenue,
        });
      }

      return days;
    }, [payments]);

  const total =
    revenueData.reduce(
      (sum, item) =>
        sum + item.revenue,
      0
    );

  /*
   * Compare:
   * last 3 days vs previous 3 days.
   *
   * We exclude today because today's
   * collection may still be incomplete.
   */
  const previousPeriod =
    revenueData
      .slice(0, 3)
      .reduce(
        (sum, item) =>
          sum + item.revenue,
        0
      );

  const recentPeriod =
    revenueData
      .slice(3, 6)
      .reduce(
        (sum, item) =>
          sum + item.revenue,
        0
      );

  const percentageChange =
    previousPeriod > 0
      ? ((recentPeriod -
          previousPeriod) /
          previousPeriod) *
        100
      : recentPeriod > 0
        ? 100
        : 0;

  const isPositive =
    percentageChange >= 0;

  const TrendIcon = isPositive
    ? TrendingUp
    : TrendingDown;

  return (
    <AppCard className="p-6">
      {/* Header */}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Revenue Overview
          </p>

          {isLoading ? (
            <div className="mt-4 flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

              <span className="text-sm text-slate-500">
                Loading revenue...
              </span>
            </div>
          ) : loadError ? (
            <p className="mt-3 text-sm font-medium text-red-600">
              {loadError}
            </p>
          ) : (
            <>
              <h2 className="mt-2 text-4xl font-bold text-slate-900">
                {currency(total)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Last 7 days
              </p>

              <div
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <TrendIcon className="h-4 w-4" />

                {percentageChange > 0
                  ? "+"
                  : ""}
                {percentageChange.toFixed(
                  1
                )}
                %
              </div>
            </>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <IndianRupee className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      {/* Chart */}

      {!isLoading && !loadError && (
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={revenueData}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2563EB"
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="95%"
                    stopColor="#2563EB"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <Tooltip
                formatter={(value) => [
                  currency(
                    Number(value)
                  ),
                  "Revenue",
                ]}
              />

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
      )}
    </AppCard>
  );
}

function toLocalDateString(
  date: Date
) {
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

function currency(value: number) {
  return `₹${value.toLocaleString(
    "en-IN"
  )}`;
}