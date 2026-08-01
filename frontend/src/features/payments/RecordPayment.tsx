import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  Save,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type { PaymentMethod } from "./types";

interface Bill {
  id: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  patientUhid: string;
  patientMobile: string;

  billDate: string;

  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;

  status:
    | "Paid"
    | "Partially Paid"
    | "Unpaid";
}

const BILLS_API =
  "http://localhost:5230/api/bills";

const PAYMENTS_API =
  "http://localhost:5230/api/payments";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function RecordPayment() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const requestedBillId =
    searchParams.get("billId") ?? "";

  const [bills, setBills] =
    useState<Bill[]>([]);

  const [billId, setBillId] =
    useState("");

  const [amount, setAmount] =
    useState(0);

  const [method, setMethod] =
    useState<PaymentMethod>("Cash");

  const [reference, setReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  /*
   * Load real bills
   */

  useEffect(() => {
    const loadBills = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await fetch(BILLS_API);

        if (!response.ok) {
          throw new Error(
            "Unable to load bills."
          );
        }

        const data: Bill[] =
          await response.json();

        setBills(data);

        /*
         * If we came here from
         * Bill Details, automatically
         * select that bill.
         */

        const requestedBill =
          data.find(
            (bill) =>
              String(bill.id) ===
                requestedBillId &&
              bill.balance > 0
          );

        if (requestedBill) {
          setBillId(
            String(
              requestedBill.id
            )
          );

          setAmount(
            requestedBill.balance
          );
        }
      } catch (error) {
        console.error(
          "Failed to load bills:",
          error
        );

        setError(
          "Unable to load outstanding bills. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBills();
  }, [requestedBillId]);

  /*
   * Only bills with money
   * still outstanding.
   */

  const outstandingBills =
    useMemo(
      () =>
        bills.filter(
          (bill) =>
            bill.balance > 0
        ),
      [bills]
    );

  const selectedBill =
    useMemo(
      () =>
        bills.find(
          (bill) =>
            String(bill.id) ===
            billId
        ),
      [bills, billId]
    );

  /*
   * Bill selection
   */

  const handleBillChange = (
    value: string
  ) => {
    setBillId(value);

    const bill =
      bills.find(
        (item) =>
          String(item.id) === value
      );

    setAmount(
      bill?.balance ?? 0
    );

    setError("");
  };

  /*
   * Save real payment
   */

  const handleSave =
    async () => {
      if (!selectedBill) {
        setError(
          "Please select an outstanding bill."
        );

        return;
      }

      if (
        amount <= 0 ||
        amount >
          selectedBill.balance
      ) {
        setError(
          `Payment must be greater than ₹0 and cannot exceed ${currency(
            selectedBill.balance
          )}.`
        );

        return;
      }

      try {
        setIsSaving(true);
        setError("");

        const response =
          await fetch(
            PAYMENTS_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                billId:
                  selectedBill.id,

                amount,

                method,

                reference:
                  reference.trim() ||
                  null,

                notes:
                  notes.trim() ||
                  null,
              }),
            }
          );

        if (!response.ok) {
          const message =
            await response.text();

          throw new Error(
            message ||
              "Unable to save payment."
          );
        }

        /*
         * Payment saved.
         *
         * Return to the bill so
         * user immediately sees
         * updated Paid / Balance.
         */

        navigate(
          `/billing/${selectedBill.id}`
        );
      } catch (error) {
        console.error(
          "Failed to save payment:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to save payment."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => {
            if (requestedBillId) {
              navigate(
                `/billing/${requestedBillId}`
              );
            } else {
              navigate(
                "/payments"
              );
            }
          }}
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <CreditCard className="h-4 w-4" />
            Payment
          </div>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Record Payment
          </h1>

          <p className="mt-1 text-slate-500">
            Record payment against
            an outstanding bill.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Bill */}

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Bill *
            </label>

            <select
              value={billId}
              disabled={
                isLoading ||
                isSaving
              }
              onChange={(event) =>
                handleBillChange(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                {isLoading
                  ? "Loading bills..."
                  : "Select outstanding bill"}
              </option>

              {outstandingBills.map(
                (bill) => (
                  <option
                    key={
                      bill.id
                    }
                    value={
                      bill.id
                    }
                  >
                    {
                      bill.billNumber
                    }{" "}
                    —{" "}
                    {
                      bill.patientName
                    }{" "}
                    — Balance{" "}
                    {currency(
                      bill.balance
                    )}
                  </option>
                )
              )}
            </select>

            {!isLoading &&
              outstandingBills.length ===
                0 && (
                <p className="mt-2 text-sm text-slate-500">
                  There are currently
                  no outstanding bills.
                </p>
              )}
          </div>

          {/* Selected Bill */}

          {selectedBill && (
            <div className="md:col-span-2 rounded-2xl bg-blue-50/60 p-4">
              <p className="font-semibold text-slate-900">
                {
                  selectedBill.patientName
                }
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {
                  selectedBill.patientUhid
                }{" "}
                •{" "}
                {
                  selectedBill.billNumber
                }
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <AmountCard
                  label="Total"
                  value={currency(
                    selectedBill.total
                  )}
                />

                <AmountCard
                  label="Already Paid"
                  value={currency(
                    selectedBill.paid
                  )}
                />

                <AmountCard
                  label="Balance"
                  value={currency(
                    selectedBill.balance
                  )}
                  highlight
                />
              </div>
            </div>
          )}

          {/* Amount */}

          <div>
            <label
              className={labelClass}
            >
              Amount *
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              max={
                selectedBill?.balance
              }
              value={amount}
              disabled={
                !selectedBill ||
                isSaving
              }
              onChange={(event) => {
                setAmount(
                  Number(
                    event.target
                      .value
                  ) || 0
                );

                setError("");
              }}
              className={
                inputClass
              }
            />

            {selectedBill && (
              <p className="mt-2 text-xs text-slate-400">
                Maximum payment:{" "}
                {currency(
                  selectedBill.balance
                )}
              </p>
            )}
          </div>

          {/* Method */}

          <div>
            <label
              className={labelClass}
            >
              Payment Method
            </label>

            <select
              value={method}
              disabled={isSaving}
              onChange={(event) =>
                setMethod(
                  event.target
                    .value as PaymentMethod
                )
              }
              className={
                inputClass
              }
            >
              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          {/* Reference */}

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Transaction /
              Reference
            </label>

            <input
              value={reference}
              disabled={isSaving}
              onChange={(event) =>
                setReference(
                  event.target.value
                )
              }
              placeholder={
                method === "Cash"
                  ? "Optional"
                  : "UPI / card / bank transaction reference"
              }
              className={
                inputClass
              }
            />
          </div>

          {/* Notes */}

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Notes
            </label>

            <textarea
              value={notes}
              disabled={isSaving}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Optional payment notes..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Save */}

        <div className="mt-6 flex justify-end">
          <AppButton
            onClick={
              handleSave
            }
            disabled={
              isLoading ||
              isSaving ||
              !selectedBill
            }
            leftIcon={
              <Save className="h-4 w-4" />
            }
          >
            {isSaving
              ? "Saving..."
              : "Save Payment"}
          </AppButton>
        </div>
      </section>
    </div>
  );
}

function AmountCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 font-bold ${
          highlight
            ? "text-red-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}