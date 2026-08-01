import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Download,
  IndianRupee,
  Printer,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

type Range = "7 Days" | "30 Days" | "This Month" | "This Year";

const ranges: Range[] = [
  "7 Days",
  "30 Days",
  "This Month",
  "This Year",
];

const revenueData = [
  { label: "Mon", amount: 5200 },
  { label: "Tue", amount: 7800 },
  { label: "Wed", amount: 6400 },
  { label: "Thu", amount: 9100 },
  { label: "Fri", amount: 8600 },
  { label: "Sat", amount: 11200 },
  { label: "Sun", amount: 7300 },
];

const paymentMethods = [
  {
    method: "Cash",
    amount: 18400,
    transactions: 31,
  },
  {
    method: "UPI",
    amount: 21600,
    transactions: 38,
  },
  {
    method: "Card",
    amount: 8200,
    transactions: 12,
  },
  {
    method: "Bank Transfer",
    amount: 3400,
    transactions: 4,
  },
];

const outstandingPatients = [
  {
    patient: "Neha Patel",
    uhid: "SMHC-0002",
    bill: "INV-2026-0002",
    amount: 300,
  },
  {
    patient: "Rajesh Jain",
    uhid: "SMHC-0003",
    bill: "INV-2026-0003",
    amount: 300,
  },
  {
    patient: "Kunal Shah",
    uhid: "SMHC-0005",
    bill: "INV-2026-0012",
    amount: 750,
  },
];

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function Reports() {
  const [range, setRange] =
    useState<Range>("7 Days");

  const maxRevenue = useMemo(
    () =>
      Math.max(
        ...revenueData.map(
          (item) => item.amount
        )
      ),
    []
  );

  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalCollected =
    paymentMethods.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  const outstanding =
    outstandingPatients.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor clinic performance,
            collections and patient activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton
            variant="secondary"
            onClick={() => window.print()}
            leftIcon={
              <Printer className="h-4 w-4" />
            }
          >
            Print
          </AppButton>

          <AppButton
            variant="secondary"
            onClick={() =>
              console.log(
                "Export will be connected later."
              )
            }
            leftIcon={
              <Download className="h-4 w-4" />
            }
          >
            Export
          </AppButton>
        </div>
      </div>

      {/* Date range */}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Report Period
              </p>

              <p className="text-sm text-slate-500">
                Viewing data for {range}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {ranges.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setRange(item)
                }
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  range === item
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          title="Revenue"
          value={currency(totalRevenue)}
          subtitle="+12.4% from previous period"
        />

        <StatCard
          icon={
            <Users className="h-5 w-5" />
          }
          title="Patients"
          value="184"
          subtitle="26 new patients"
        />

        <StatCard
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Visits"
          value="236"
          subtitle="34 follow-up visits"
        />

        <StatCard
          icon={
            <CreditCard className="h-5 w-5" />
          }
          title="Collected"
          value={currency(totalCollected)}
          subtitle={`${currency(
            outstanding
          )} outstanding`}
        />
      </div>

      {/* Revenue chart */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Revenue Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily billing performance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            +12.4%
          </div>
        </div>

        <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
          {revenueData.map((item) => {
            const height =
              (item.amount / maxRevenue) *
              100;

            return (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col justify-end"
              >
                <div className="group relative flex h-full items-end">
                  <div
                    className="w-full rounded-t-xl bg-blue-500 transition hover:bg-blue-600"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                    {currency(item.amount)}
                  </div>
                </div>

                <p className="mt-3 text-center text-xs font-medium text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Patient statistics */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Patient Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Patient distribution for the
            selected period.
          </p>

          <div className="mt-6 space-y-5">
            <ProgressRow
              label="New Patients"
              value={26}
              total={184}
            />

            <ProgressRow
              label="Existing Patients"
              value={132}
              total={184}
            />

            <ProgressRow
              label="Follow-up Patients"
              value={26}
              total={184}
            />
          </div>
        </section>

        {/* Visit statistics */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Visit Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Consultation activity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <MiniStat
              title="Total Visits"
              value="236"
            />

            <MiniStat
              title="Consultations"
              value="178"
            />

            <MiniStat
              title="Follow-ups"
              value="34"
            />

            <MiniStat
              title="Reviews"
              value="24"
            />
          </div>
        </section>
      </div>

      {/* Payment collection */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Payment Collection
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Collection by payment method.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-3">
                  Payment Method
                </th>

                <th className="pb-3">
                  Transactions
                </th>

                <th className="pb-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {paymentMethods.map(
                (item) => (
                  <tr
                    key={item.method}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      {item.method}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {item.transactions}
                    </td>

                    <td className="py-4 text-right font-semibold text-slate-900">
                      {currency(
                        item.amount
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Outstanding */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Outstanding Dues
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Patients with pending
              balances.
            </p>
          </div>

          <p className="text-lg font-bold text-red-600">
            {currency(outstanding)}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-3">
                  Patient
                </th>

                <th className="pb-3">
                  UHID
                </th>

                <th className="pb-3">
                  Bill
                </th>

                <th className="pb-3 text-right">
                  Due
                </th>
              </tr>
            </thead>

            <tbody>
              {outstandingPatients.map(
                (item) => (
                  <tr
                    key={item.bill}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      {item.patient}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {item.uhid}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {item.bill}
                    </td>

                    <td className="py-4 text-right font-bold text-red-600">
                      {currency(
                        item.amount
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (value / total) * 100
        );

  return (
    <div>
      <div className="mb-2 flex justify-between gap-4">
        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}