import { useMemo, useState } from "react";

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

import { bills } from "@/features/billing/data/bills";

import type { PaymentMethod } from "./types";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function RecordPayment() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const requestedBillId =
    searchParams.get("billId") ?? "";

  const initialBillId = bills.some(
    (bill) =>
      String(bill.id) === requestedBillId &&
      bill.balance > 0
  )
    ? requestedBillId
    : "";

  const [billId, setBillId] =
    useState(initialBillId);

  const selectedBill = useMemo(
    () =>
      bills.find(
        (bill) =>
          String(bill.id) === billId
      ),
    [billId]
  );

  const [amount, setAmount] =
    useState(
      selectedBill?.balance ?? 0
    );

  const [method, setMethod] =
    useState<PaymentMethod>("Cash");

  const [reference, setReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const handleBillChange = (
    value: string
  ) => {
    setBillId(value);

    const bill = bills.find(
      (item) =>
        String(item.id) === value
    );

    setAmount(bill?.balance ?? 0);
    setError("");
  };

  const handleSave = () => {
    if (!selectedBill) {
      setError(
        "Please select an outstanding bill."
      );
      return;
    }

    if (
      amount <= 0 ||
      amount > selectedBill.balance
    ) {
      setError(
        `Payment must be between ₹1 and ${currency(
          selectedBill.balance
        )}.`
      );
      return;
    }

    console.log("Payment ready:", {
      bill: selectedBill,
      amount,
      method,
      reference,
      notes,
    });

    navigate("/payments");
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/payments")
          }
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
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
            Record payment against an outstanding bill.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Bill *
            </label>

            <select
              value={billId}
              onChange={(event) =>
                handleBillChange(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Select outstanding bill
              </option>

              {bills
                .filter(
                  (bill) =>
                    bill.balance > 0
                )
                .map((bill) => (
                  <option
                    key={bill.id}
                    value={bill.id}
                  >
                    {bill.billNumber} —{" "}
                    {bill.patientName} — Balance{" "}
                    {currency(bill.balance)}
                  </option>
                ))}
            </select>
          </div>

          {selectedBill && (
            <div className="md:col-span-2 rounded-2xl bg-blue-50/60 p-4">
              <p className="font-semibold text-slate-900">
                {selectedBill.patientName}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedBill.uhid} •{" "}
                {selectedBill.billNumber}
              </p>

              <div className="mt-3 flex flex-wrap gap-6 text-sm">
                <span>
                  Total:{" "}
                  <strong>
                    {currency(
                      selectedBill.total
                    )}
                  </strong>
                </span>

                <span>
                  Paid:{" "}
                  <strong>
                    {currency(
                      selectedBill.paid
                    )}
                  </strong>
                </span>

                <span>
                  Balance:{" "}
                  <strong className="text-red-600">
                    {currency(
                      selectedBill.balance
                    )}
                  </strong>
                </span>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>
              Amount *
            </label>

            <input
              type="number"
              min="1"
              max={
                selectedBill?.balance
              }
              value={amount}
              onChange={(event) =>
                setAmount(
                  Number(
                    event.target.value
                  ) || 0
                )
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Payment Method
            </label>

            <select
              value={method}
              onChange={(event) =>
                setMethod(
                  event.target
                    .value as PaymentMethod
                )
              }
              className={inputClass}
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

          <div className="md:col-span-2">
            <label className={labelClass}>
              Transaction / Reference
            </label>

            <input
              value={reference}
              onChange={(event) =>
                setReference(
                  event.target.value
                )
              }
              placeholder="Optional transaction reference"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Optional payment notes..."
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <AppButton
            onClick={handleSave}
            leftIcon={
              <Save className="h-4 w-4" />
            }
          >
            Save Payment
          </AppButton>
        </div>
      </section>
    </div>
  );
}