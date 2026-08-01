import { useEffect, useState } from "react";
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

interface BillItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

interface Bill {
  id: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  uhid: string;

  date: string;

  items: BillItem[];

  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;

  status: "Paid" | "Partially Paid" | "Unpaid";
}

const API_URL =
  "http://localhost:5230/api/bills";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function BillDetails() {
  const navigate = useNavigate();

  const { billId } = useParams();

  const [bill, setBill] =
    useState<Bill | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    const loadBill = async () => {
      if (!billId) {
        setLoadError(
          "Invalid bill."
        );

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        setLoadError("");

        const response =
          await fetch(
            `${API_URL}/${billId}`
          );

        if (response.status === 404) {
          setLoadError(
            "Bill not found."
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load bill."
          );
        }

        const data: Bill =
          await response.json();

        setBill(data);
      } catch (error) {
        console.error(
          "Failed to load bill:",
          error
        );

        setLoadError(
          "Unable to load this bill. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBill();
  }, [billId]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-900">
          Loading bill...
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while the
          invoice is loaded.
        </p>
      </div>
    );
  }

  if (loadError || !bill) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Bill not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError ||
            "The requested bill could not be found."}
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/billing")
            }
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
            onClick={() =>
              navigate("/billing")
            }
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to billing"
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
              {formatDate(
                bill.date
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton
            variant="secondary"
            onClick={() =>
              window.print()
            }
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

      {/* Status */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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

          <BillStatusBadge
            status={bill.status}
          />
        </div>
      </section>

      {/* Invoice */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Receipt className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Invoice Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Charges included in
              this bill.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-3">
                  Description
                </th>

                <th className="pb-3">
                  Qty
                </th>

                <th className="pb-3">
                  Rate
                </th>

                <th className="pb-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {bill.items.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-sm last:border-0"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      {
                        item.description
                      }
                    </td>

                    <td className="py-4 text-slate-600">
                      {
                        item.quantity
                      }
                    </td>

                    <td className="py-4 text-slate-600">
                      {currency(
                        item.rate
                      )}
                    </td>

                    <td className="py-4 text-right font-semibold text-slate-900">
                      {currency(
                        item.quantity *
                          item.rate
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}

        <div className="ml-auto mt-8 max-w-sm space-y-3">
          <Row
            label="Subtotal"
            value={currency(
              bill.subtotal
            )}
          />

          <Row
            label="Discount"
            value={
              bill.discount > 0
                ? `-${currency(
                    bill.discount
                  )}`
                : currency(0)
            }
          />

          <div className="border-t border-slate-200 pt-3">
            <Row
              label="Total"
              value={currency(
                bill.total
              )}
              strong
            />
          </div>

          <Row
            label="Paid"
            value={currency(
              bill.paid
            )}
          />

          <div className="border-t border-slate-200 pt-3">
            <Row
              label="Balance"
              value={currency(
                bill.balance
              )}
              strong
            />
          </div>
        </div>
      </section>

      {/* Payment summary */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current payment status
              for this invoice.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">
              Outstanding Balance
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {currency(
                bill.balance
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function BillStatusBadge({
  status,
}: {
  status: Bill["status"];
}) {
  const style =
    status === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "Partially Paid"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${style}`}
    >
      {status}
    </span>
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

function formatDate(
  value: string
) {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}