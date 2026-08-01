import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CreditCard,
  IndianRupee,
  Plus,
  Search,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { payments } from "./data/payments";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function Payments() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter(
      (payment) =>
        payment.patientName
          .toLowerCase()
          .includes(query) ||
        payment.uhid
          .toLowerCase()
          .includes(query) ||
        payment.receiptNumber
          .toLowerCase()
          .includes(query) ||
        payment.billNumber
          .toLowerCase()
          .includes(query)
    );
  }, [search]);

  const total = payments.reduce(
    (sum, payment) =>
      sum + payment.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <CreditCard className="h-4 w-4" />
            Finance
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Payments
          </h1>

          <p className="mt-2 text-slate-500">
            View and record patient payments.
          </p>
        </div>

        <AppButton
          onClick={() =>
            navigate("/payments/new")
          }
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Record Payment
        </AppButton>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Payments
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {payments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Collected
            </p>

            <IndianRupee className="h-4 w-4 text-slate-300" />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {currency(total)}
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search receipt, bill or patient..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_1.2fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <span>Receipt</span>
          <span>Patient</span>
          <span>Bill</span>
          <span>Date</span>
          <span>Method</span>
          <span className="text-right">
            Amount
          </span>
        </div>

        {filteredPayments.map((payment) => (
          <button
            key={payment.id}
            type="button"
            onClick={() =>
              navigate(
                `/payments/${payment.id}/receipt`
              )
            }
            className="grid w-full gap-3 border-b border-slate-100 px-5 py-5 text-left transition last:border-0 hover:bg-blue-50/40 md:grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_1.2fr] md:items-center md:gap-4 md:px-6"
          >
            <span className="font-semibold text-blue-600">
              {payment.receiptNumber}
            </span>

            <div>
              <p className="font-semibold text-slate-900">
                {payment.patientName}
              </p>

              <p className="text-xs text-slate-400">
                {payment.uhid}
              </p>
            </div>

            <span className="text-sm text-slate-600">
              {payment.billNumber}
            </span>

            <span className="text-sm text-slate-600">
              {payment.date}
            </span>

            <span className="text-sm text-slate-600">
              {payment.method}
            </span>

            <span className="font-bold text-slate-900 md:text-right">
              {currency(payment.amount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}