import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronRight,
  FilePlus2,
  IndianRupee,
  Receipt,
  Search,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { bills } from "./data/bills";
import type { BillStatus } from "./types";

type Filter = "All" | BillStatus;

const filters: Filter[] = [
  "All",
  "Paid",
  "Partially Paid",
  "Unpaid",
];

const statusStyles: Record<BillStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  "Partially Paid": "bg-amber-50 text-amber-700",
  Unpaid: "bg-red-50 text-red-700",
};

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function Billing() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bills.filter((bill) => {
      const matchesSearch =
        bill.patientName.toLowerCase().includes(query) ||
        bill.uhid.toLowerCase().includes(query) ||
        bill.billNumber.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || bill.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalBilled = bills.reduce(
    (sum, bill) => sum + bill.total,
    0
  );

  const totalCollected = bills.reduce(
    (sum, bill) => sum + bill.paid,
    0
  );

  const totalOutstanding = bills.reduce(
    (sum, bill) => sum + bill.balance,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Receipt className="h-4 w-4" />
            Finance
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Billing
          </h1>

          <p className="mt-2 text-slate-500">
            Create bills and track patient balances.
          </p>
        </div>

        <AppButton
          onClick={() => navigate("/billing/new")}
          leftIcon={<FilePlus2 className="h-4 w-4" />}
        >
          Create Bill
        </AppButton>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Bills"
          value={String(bills.length)}
        />

        <SummaryCard
          title="Total Billed"
          value={currency(totalBilled)}
        />

        <SummaryCard
          title="Collected"
          value={currency(totalCollected)}
        />

        <SummaryCard
          title="Outstanding"
          value={currency(totalOutstanding)}
        />
      </div>

      {/* Search */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search bill, patient or UHID..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  filter === item
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="grid grid-cols-[1.4fr_2fr_1.2fr_1.2fr_1.2fr_1.4fr_40px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Bill</span>
          <span>Patient</span>
          <span>Date</span>
          <span>Total</span>
          <span>Balance</span>
          <span>Status</span>
          <span />
        </div>

        {filteredBills.map((bill) => (
          <button
            key={bill.id}
            type="button"
            onClick={() =>
              navigate(`/billing/${bill.id}`)
            }
            className="group grid w-full grid-cols-[1.4fr_2fr_1.2fr_1.2fr_1.2fr_1.4fr_40px] items-center gap-4 border-b border-slate-100 px-6 py-5 text-left transition last:border-0 hover:bg-blue-50/40"
          >
            <span className="font-semibold text-slate-900">
              {bill.billNumber}
            </span>

            <div>
              <p className="font-semibold text-slate-900">
                {bill.patientName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {bill.uhid}
              </p>
            </div>

            <span className="text-sm text-slate-600">
              {bill.date}
            </span>

            <span className="font-semibold text-slate-900">
              {currency(bill.total)}
            </span>

            <span className="text-sm text-slate-600">
              {currency(bill.balance)}
            </span>

            <span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[bill.status]
                }`}
              >
                {bill.status}
              </span>
            </span>

            <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
          </button>
        ))}

        {filteredBills.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500">
            No bills found.
          </div>
        )}
      </div>

      {/* Mobile */}

      <div className="space-y-3 md:hidden">
        {filteredBills.map((bill) => (
          <button
            key={bill.id}
            type="button"
            onClick={() =>
              navigate(`/billing/${bill.id}`)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">
                  {bill.billNumber}
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {bill.patientName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {bill.uhid}
                </p>
              </div>

              <span
                className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                  statusStyles[bill.status]
                }`}
              >
                {bill.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-1 font-semibold">
                  {currency(bill.total)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Balance
                </p>

                <p className="mt-1 font-semibold">
                  {currency(bill.balance)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <IndianRupee className="h-4 w-4 text-slate-300" />
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}