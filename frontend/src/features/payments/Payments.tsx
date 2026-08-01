import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CreditCard,
  IndianRupee,
  Plus,
  Search,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

interface Payment {
  id: number;

  billId: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  patientUhid: string;

  amount: number;

  method: string;

  reference: string | null;
  notes: string | null;

  paymentDate: string;
  createdAt: string;
}

const API_URL =
  "http://localhost:5230/api/payments";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  /*
   * Load payments from database
   */

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Unable to load payments."
          );
        }

        const data: Payment[] =
          await response.json();

        setPayments(data);
      } catch (error) {
        console.error(
          "Failed to load payments:",
          error
        );

        setLoadError(
          "Unable to load payments. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  /*
   * Search
   */

  const filteredPayments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return payments;
      }

      return payments.filter(
        (payment) =>
          payment.patientName
            .toLowerCase()
            .includes(query) ||
          payment.patientUhid
            .toLowerCase()
            .includes(query) ||
          payment.billNumber
            .toLowerCase()
            .includes(query) ||
          payment.method
            .toLowerCase()
            .includes(query) ||
          (payment.reference ?? "")
            .toLowerCase()
            .includes(query)
      );
    }, [payments, search]);

  /*
   * Summary
   */

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
          leftIcon={
            <Plus className="h-4 w-4" />
          }
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
            {isLoading
              ? "—"
              : payments.length}
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
            {isLoading
              ? "—"
              : currency(total)}
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
              setSearch(
                event.target.value
              )
            }
            placeholder="Search bill, patient, UHID or reference..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* Error */}

      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {loadError}
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.2fr_2fr_1.5fr_1.3fr_1fr_1.2fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <span>Payment</span>

          <span>Patient</span>

          <span>Bill</span>

          <span>Date</span>

          <span>Method</span>

          <span className="text-right">
            Amount
          </span>
        </div>

        {/* Loading */}

        {isLoading && (
          <div className="px-6 py-16 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-900">
              Loading payments...
            </p>
          </div>
        )}

        {/* Payments */}

        {!isLoading &&
          filteredPayments.map(
            (payment) => (
              <button
                key={payment.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/payments/${payment.id}/receipt`
                  )
                }
                className="grid w-full gap-3 border-b border-slate-100 px-5 py-5 text-left transition last:border-0 hover:bg-blue-50/40 md:grid-cols-[1.2fr_2fr_1.5fr_1.3fr_1fr_1.2fr] md:items-center md:gap-4 md:px-6"
              >
                {/* Payment */}

                <div>
                  <p className="font-semibold text-blue-600">
                    PAY-
                    {String(
                      payment.id
                    ).padStart(
                      4,
                      "0"
                    )}
                  </p>

                  {payment.reference && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {
                        payment.reference
                      }
                    </p>
                  )}
                </div>

                {/* Patient */}

                <div>
                  <p className="font-semibold text-slate-900">
                    {
                      payment.patientName
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      payment.patientUhid
                    }
                  </p>
                </div>

                {/* Bill */}

                <span className="text-sm text-slate-600">
                  {
                    payment.billNumber
                  }
                </span>

                {/* Date */}

                <span className="text-sm text-slate-600">
                  {formatDate(
                    payment.paymentDate
                  )}
                </span>

                {/* Method */}

                <span className="text-sm text-slate-600">
                  {payment.method}
                </span>

                {/* Amount */}

                <span className="font-bold text-slate-900 md:text-right">
                  {currency(
                    payment.amount
                  )}
                </span>
              </button>
            )
          )}

        {/* Empty */}

        {!isLoading &&
          !loadError &&
          filteredPayments.length ===
            0 && (
            <div className="px-6 py-16 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-900">
                {payments.length === 0
                  ? "No payments recorded yet"
                  : "No payments found"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {payments.length === 0
                  ? "Payments recorded against patient bills will appear here."
                  : "Try changing your search."}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

function formatDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
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