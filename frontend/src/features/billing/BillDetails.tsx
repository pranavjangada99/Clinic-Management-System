import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  Printer,
  Receipt,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { bills } from "./data/bills";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function BillDetails() {
  const navigate = useNavigate();
  const { billId } = useParams();

  const bill = bills.find(
    (item) => item.id === Number(billId)
  );

  if (!bill) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">
          Bill not found
        </h1>

        <div className="mt-6">
          <AppButton
            onClick={() => navigate("/billing")}
          >
            Back to Billing
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-blue-600">
              Invoice
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {bill.billNumber}
            </h1>

            <p className="mt-1 text-slate-500">
              {bill.date}
            </p>
          </div>
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

          {bill.balance > 0 && (
            <AppButton
              onClick={() =>
                navigate(
                  `/payments/new?billId=${bill.id}`
                )
              }
              leftIcon={
                <CreditCard className="h-4 w-4" />
              }
            >
              Record Payment
            </AppButton>
          )}
        </div>
      </div>

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Patient
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {bill.patientName}
            </p>

            <p className="text-sm text-slate-500">
              {bill.uhid}
            </p>
          </div>
        </div>
      </section>

      {/* Invoice */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Receipt className="h-5 w-5 text-blue-600" />

          <h2 className="font-semibold text-slate-900">
            Invoice Items
          </h2>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3">
                  Description
                </th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Rate</th>
                <th className="pb-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {bill.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-sm last:border-0"
                >
                  <td className="py-4 font-semibold text-slate-900">
                    {item.description}
                  </td>

                  <td className="py-4">
                    {item.quantity}
                  </td>

                  <td className="py-4">
                    {currency(item.rate)}
                  </td>

                  <td className="py-4 text-right font-semibold">
                    {currency(
                      item.quantity * item.rate
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-8 max-w-sm space-y-3">
          <Row
            label="Subtotal"
            value={currency(bill.subtotal)}
          />

          <Row
            label="Discount"
            value={`-${currency(bill.discount)}`}
          />

          <div className="border-t border-slate-200 pt-3">
            <Row
              label="Total"
              value={currency(bill.total)}
              strong
            />
          </div>

          <Row
            label="Paid"
            value={currency(bill.paid)}
          />

          <div className="border-t border-slate-200 pt-3">
            <Row
              label="Balance"
              value={currency(bill.balance)}
              strong
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span
        className={
          strong
            ? "font-semibold text-slate-900"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900"
            : "font-semibold text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}