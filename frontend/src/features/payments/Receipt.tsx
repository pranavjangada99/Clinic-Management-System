import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  Printer,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { payments } from "./data/payments";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function Receipt() {
  const navigate = useNavigate();

  const { paymentId } = useParams();

  const payment = payments.find(
    (item) =>
      item.id === Number(paymentId)
  );

  if (!payment) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">
          Receipt not found
        </h1>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/payments")
            }
          >
            Back to Payments
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Controls */}

      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/payments")
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Receipt
            </h1>

            <p className="text-sm text-slate-500">
              {payment.receiptNumber}
            </p>
          </div>
        </div>

        <AppButton
          onClick={() =>
            window.print()
          }
          leftIcon={
            <Printer className="h-4 w-4" />
          }
        >
          Print Receipt
        </AppButton>
      </div>

      {/* Receipt */}

      <article className="bg-white p-8 shadow-sm ring-1 ring-slate-200 print:p-0 print:shadow-none print:ring-0 sm:p-12">
        <header className="border-b-2 border-slate-900 pb-6">
          <div className="flex items-start justify-between gap-5">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white print:border print:border-slate-900 print:bg-white print:text-slate-900">
                <HeartPulse className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Shree Mahavir Homoeopathic Clinic
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Payment Receipt
                </p>
              </div>
            </div>

            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </header>

        <section className="grid gap-5 border-b border-slate-200 py-6 sm:grid-cols-2">
          <ReceiptField
            label="Receipt No."
            value={payment.receiptNumber}
          />

          <ReceiptField
            label="Date"
            value={payment.date}
            right
          />

          <ReceiptField
            label="Patient"
            value={payment.patientName}
          />

          <ReceiptField
            label="UHID"
            value={payment.uhid}
            right
          />

          <ReceiptField
            label="Bill No."
            value={payment.billNumber}
          />

          <ReceiptField
            label="Payment Method"
            value={payment.method}
            right
          />
        </section>

        <section className="py-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Amount Received
          </p>

          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
            {currency(payment.amount)}
          </p>

          <div className="mx-auto mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Payment Received
          </div>
        </section>

        {payment.reference && (
          <section className="border-t border-slate-200 py-5">
            <ReceiptField
              label="Transaction Reference"
              value={payment.reference}
            />
          </section>
        )}

        {payment.notes && (
          <section className="border-t border-slate-200 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {payment.notes}
            </p>
          </section>
        )}

        <footer className="mt-16 flex justify-end">
          <div className="min-w-[200px] border-t border-slate-400 pt-3 text-center">
            <p className="font-semibold text-slate-900">
              Authorised Signature
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Shree Mahavir Homoeopathic Clinic
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}

function ReceiptField({
  label,
  value,
  right = false,
}: {
  label: string;
  value: string;
  right?: boolean;
}) {
  return (
    <div className={right ? "sm:text-right" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}