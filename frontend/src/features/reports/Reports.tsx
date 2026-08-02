import { apiFetch } from "@/lib/api";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Download,
  IndianRupee,
  Loader2,
  Printer,
  UserRound,
  Users,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

type Range =
  | "7 Days"
  | "30 Days"
  | "This Month"
  | "This Year";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Visit {
  id: number;
  patientId: number;
  patientName: string;
  patientUhid: string;
  visitDate: string;
  followUpDate: string | null;
  status: string;
  createdAt: string;
}

interface Bill {
  id: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  patientUhid: string;

  billDate: string;

  total: number;
  paid: number;
  balance: number;

  status: string;
}

interface Payment {
  id: number;

  billId: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  patientUhid: string;

  amount: number;
  method: string;

  paymentDate: string;
  receiptNumber: string;
}

interface RevenueDay {
  date: string;
  label: string;
  amount: number;
}

interface PaymentMethodSummary {
  method: string;
  amount: number;
  transactions: number;
}

const ranges: Range[] = [
  "7 Days",
  "30 Days",
  "This Month",
  "This Year",
];

const PATIENTS_API =
  "/patients";

const VISITS_API =
  "/visits";

const BILLS_API =
  "/bills";

const PAYMENTS_API =
  "/payments";

export default function Reports() {
  const [range, setRange] =
    useState<Range>("7 Days");

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [visits, setVisits] =
    useState<Visit[]>([]);

  const [bills, setBills] =
    useState<Bill[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        const [
          patientsResponse,
          visitsResponse,
          billsResponse,
          paymentsResponse,
        ] = await Promise.all([
          apiFetch(PATIENTS_API),
          apiFetch(VISITS_API),
          apiFetch(BILLS_API),
          apiFetch(PAYMENTS_API),
        ]);

        if (
          !patientsResponse.ok ||
          !visitsResponse.ok ||
          !billsResponse.ok ||
          !paymentsResponse.ok
        ) {
          throw new Error(
            "Unable to load reports."
          );
        }

        const [
          patientData,
          visitData,
          billData,
          paymentData,
        ] = await Promise.all([
          patientsResponse.json(),
          visitsResponse.json(),
          billsResponse.json(),
          paymentsResponse.json(),
        ]);

        if (!cancelled) {
          setPatients(patientData);
          setVisits(visitData);
          setBills(billData);
          setPayments(paymentData);
        }
      } catch (error) {
        console.error(
          "Failed to load reports:",
          error
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load report data."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const period =
    useMemo(
      () => getRangeDates(range),
      [range]
    );

  const filteredPatients =
    useMemo(
      () =>
        patients.filter((patient) =>
          isDateTimeInRange(
            patient.createdAt,
            period.start,
            period.end
          )
        ),
      [
        patients,
        period.start,
        period.end,
      ]
    );

  const filteredVisits =
    useMemo(
      () =>
        visits.filter((visit) =>
          isDateOnlyInRange(
            visit.visitDate,
            period.start,
            period.end
          )
        ),
      [
        visits,
        period.start,
        period.end,
      ]
    );

  const filteredBills =
    useMemo(
      () =>
        bills.filter((bill) =>
          isDateOnlyInRange(
            bill.billDate,
            period.start,
            period.end
          )
        ),
      [
        bills,
        period.start,
        period.end,
      ]
    );

  const filteredPayments =
    useMemo(
      () =>
        payments.filter((payment) =>
          isDateTimeInRange(
            payment.paymentDate,
            period.start,
            period.end
          )
        ),
      [
        payments,
        period.start,
        period.end,
      ]
    );

  /*
   * Revenue = actual money collected.
   * We use Payments rather than Bills
   * so the report reflects collections.
   */
  const totalCollected =
    useMemo(
      () =>
        filteredPayments.reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        ),
      [filteredPayments]
    );

  /*
   * Billing value generated during
   * the selected report period.
   */
  const totalBilled =
    useMemo(
      () =>
        filteredBills.reduce(
          (sum, bill) =>
            sum + bill.total,
          0
        ),
      [filteredBills]
    );

  /*
   * Outstanding is intentionally based
   * on ALL currently outstanding bills,
   * not only bills created in the selected
   * period. This makes it useful as the
   * clinic's current receivable balance.
   */
  const outstandingBills =
    useMemo(
      () =>
        bills
          .filter(
            (bill) =>
              bill.balance > 0
          )
          .sort(
            (a, b) =>
              b.balance - a.balance
          ),
      [bills]
    );

  const totalOutstanding =
    useMemo(
      () =>
        outstandingBills.reduce(
          (sum, bill) =>
            sum + bill.balance,
          0
        ),
      [outstandingBills]
    );

  const completedVisits =
    useMemo(
      () =>
        filteredVisits.filter(
          (visit) =>
            visit.status ===
            "Completed"
        ).length,
      [filteredVisits]
    );

  const pendingVisits =
    useMemo(
      () =>
        filteredVisits.filter(
          (visit) =>
            visit.status !==
            "Completed"
        ).length,
      [filteredVisits]
    );

  /*
   * Unique patients who had a visit
   * during the selected period.
   */
  const uniqueVisitedPatients =
    useMemo(
      () =>
        new Set(
          filteredVisits.map(
            (visit) =>
              visit.patientId
          )
        ).size,
      [filteredVisits]
    );

  /*
   * Patients created during the
   * selected report period.
   */
  const newPatients =
    filteredPatients.length;

  const activePatients =
    useMemo(
      () =>
        patients.filter(
          (patient) =>
            patient.status ===
            "Active"
        ).length,
      [patients]
    );

  const paymentMethods =
    useMemo<
      PaymentMethodSummary[]
    >(() => {
      const map =
        new Map<
          string,
          PaymentMethodSummary
        >();

      filteredPayments.forEach(
        (payment) => {
          const current =
            map.get(
              payment.method
            );

          if (current) {
            current.amount +=
              payment.amount;

            current.transactions +=
              1;
          } else {
            map.set(
              payment.method,
              {
                method:
                  payment.method,

                amount:
                  payment.amount,

                transactions:
                  1,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          b.amount - a.amount
      );
    }, [filteredPayments]);

  const revenueData =
    useMemo(
      () =>
        buildRevenueData(
          filteredPayments,
          period.start,
          period.end,
          range
        ),
      [
        filteredPayments,
        period.start,
        period.end,
        range,
      ]
    );

  const maxRevenue =
    Math.max(
      ...revenueData.map(
        (item) =>
          item.amount
      ),
      1
    );

  const handleExport =
    () => {
      const rows: string[][] = [
        [
          "Clinic Report",
          range,
        ],

        [
          "Period",
          `${formatDate(
            period.start
          )} - ${formatDate(
            period.end
          )}`,
        ],

        [],

        [
          "Summary",
          "Value",
        ],

        [
          "Collected Revenue",
          totalCollected.toString(),
        ],

        [
          "Total Billed",
          totalBilled.toString(),
        ],

        [
          "New Patients",
          newPatients.toString(),
        ],

        [
          "Unique Patients Visited",
          uniqueVisitedPatients.toString(),
        ],

        [
          "Total Visits",
          filteredVisits.length.toString(),
        ],

        [
          "Completed Visits",
          completedVisits.toString(),
        ],

        [
          "Pending Visits",
          pendingVisits.toString(),
        ],

        [
          "Current Outstanding",
          totalOutstanding.toString(),
        ],

        [],

        [
          "Payment Method",
          "Transactions",
          "Amount",
        ],

        ...paymentMethods.map(
          (item) => [
            item.method,
            item.transactions.toString(),
            item.amount.toString(),
          ]
        ),

        [],

        [
          "Outstanding Patient",
          "UHID",
          "Bill",
          "Balance",
        ],

        ...outstandingBills.map(
          (bill) => [
            bill.patientName,
            bill.patientUhid,
            bill.billNumber,
            bill.balance.toString(),
          ]
        ),
      ];

      const csv =
        rows
          .map((row) =>
            row
              .map(csvValue)
              .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `clinic-report-${getLocalDateString()}.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );
    };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-4 font-medium text-slate-600">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-red-400" />

        <h1 className="mt-4 text-xl font-bold text-red-900">
          Reports unavailable
        </h1>

        <p className="mt-2 text-sm text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

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
            collections and patient
            activity.
          </p>
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

          <AppButton
            variant="secondary"
            onClick={
              handleExport
            }
            leftIcon={
              <Download className="h-4 w-4" />
            }
          >
            Export CSV
          </AppButton>
        </div>
      </div>

      {/* Date Range */}

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
                {formatDate(
                  period.start
                )}{" "}
                –{" "}
                {formatDate(
                  period.end
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {ranges.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setRange(
                      item
                    )
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    range ===
                    item
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Statistics */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          title="Collected"
          value={currency(
            totalCollected
          )}
          subtitle={`${currency(
            totalBilled
          )} billed in period`}
        />

        <StatCard
          icon={
            <Users className="h-5 w-5" />
          }
          title="Patients"
          value={String(
            uniqueVisitedPatients
          )}
          subtitle={`${newPatients} new patients`}
        />

        <StatCard
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Visits"
          value={String(
            filteredVisits.length
          )}
          subtitle={`${completedVisits} completed`}
        />

        <StatCard
          icon={
            <CreditCard className="h-5 w-5" />
          }
          title="Outstanding"
          value={currency(
            totalOutstanding
          )}
          subtitle={`${outstandingBills.length} bills pending`}
        />
      </div>

      {/* Revenue Chart */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Actual payments received
            during the selected period.
          </p>
        </div>

        {revenueData.length ===
        0 ? (
          <EmptyState
            text="No payments recorded for this period."
          />
        ) : (
          <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
            {revenueData.map(
              (item) => {
                const height =
                  (item.amount /
                    maxRevenue) *
                  100;

                return (
                  <div
                    key={
                      item.date
                    }
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                  >
                    <div className="group relative flex h-full items-end">
                      <div
                        className="w-full rounded-t-xl bg-blue-500 transition hover:bg-blue-600"
                        style={{
                          height:
                            item.amount >
                            0
                              ? `${Math.max(
                                  height,
                                  2
                                )}%`
                              : "0%",
                        }}
                      />

                      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                        {currency(
                          item.amount
                        )}
                      </div>
                    </div>

                    <p className="mt-3 truncate text-center text-[11px] font-medium text-slate-500">
                      {
                        item.label
                      }
                    </p>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Patient Overview */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Patient Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Patient activity for the
            selected period.
          </p>

          <div className="mt-6 space-y-5">
            <ProgressRow
              label="New Patients"
              value={
                newPatients
              }
              total={Math.max(
                uniqueVisitedPatients,
                newPatients
              )}
            />

            <ProgressRow
              label="Patients Visited"
              value={
                uniqueVisitedPatients
              }
              total={Math.max(
                uniqueVisitedPatients,
                newPatients
              )}
            />

            <ProgressRow
              label="Active Patients Overall"
              value={
                activePatients
              }
              total={
                patients.length
              }
            />
          </div>
        </section>

        {/* Visit Overview */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Visit Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Consultation activity for
            the selected period.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <MiniStat
              title="Total Visits"
              value={String(
                filteredVisits.length
              )}
            />

            <MiniStat
              title="Completed"
              value={String(
                completedVisits
              )}
            />

            <MiniStat
              title="Pending"
              value={String(
                pendingVisits
              )}
            />

            <MiniStat
              title="Unique Patients"
              value={String(
                uniqueVisitedPatients
              )}
            />
          </div>
        </section>
      </div>

      {/* Payment Collection */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Payment Collection
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Collections grouped by
            payment method.
          </p>
        </div>

        {paymentMethods.length ===
        0 ? (
          <EmptyState
            text="No payments recorded for this period."
          />
        ) : (
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
                      key={
                        item.method
                      }
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 font-semibold text-slate-900">
                        {
                          item.method
                        }
                      </td>

                      <td className="py-4 text-sm text-slate-600">
                        {
                          item.transactions
                        }
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
        )}
      </section>

      {/* Outstanding */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Outstanding Dues
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current unpaid balances
              across all bills.
            </p>
          </div>

          <p className="text-lg font-bold text-red-600">
            {currency(
              totalOutstanding
            )}
          </p>
        </div>

        {outstandingBills.length ===
        0 ? (
          <EmptyState
            text="No outstanding dues."
          />
        ) : (
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
                {outstandingBills.map(
                  (bill) => (
                    <tr
                      key={
                        bill.id
                      }
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 font-semibold text-slate-900">
                        {
                          bill.patientName
                        }
                      </td>

                      <td className="py-4 text-sm text-slate-500">
                        {
                          bill.patientUhid
                        }
                      </td>

                      <td className="py-4 text-sm text-slate-600">
                        {
                          bill.billNumber
                        }
                      </td>

                      <td className="py-4 text-right font-bold text-red-600">
                        {currency(
                          bill.balance
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
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
      : Math.min(
          100,
          Math.round(
            (value / total) *
              100
          )
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
            width:
              `${percentage}%`,
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

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
      <BarChart3 className="mx-auto h-7 w-7 text-slate-300" />

      <p className="mt-3 text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
}

function getRangeDates(
  range: Range
) {
  const end =
    startOfDay(
      new Date()
    );

  const start =
    new Date(end);

  if (range === "7 Days") {
    start.setDate(
      start.getDate() - 6
    );
  }

  if (
    range === "30 Days"
  ) {
    start.setDate(
      start.getDate() - 29
    );
  }

  if (
    range ===
    "This Month"
  ) {
    start.setDate(1);
  }

  if (
    range ===
    "This Year"
  ) {
    start.setMonth(
      0,
      1
    );
  }

  return {
    start,
    end,
  };
}

function buildRevenueData(
  payments: Payment[],
  start: Date,
  end: Date,
  range: Range
): RevenueDay[] {
  /*
   * For year view, monthly bars
   * are much more readable than
   * 365 daily bars.
   */
  if (
    range === "This Year"
  ) {
    const data:
      RevenueDay[] = [];

    const cursor =
      new Date(
        start.getFullYear(),
        start.getMonth(),
        1
      );

    const finalMonth =
      new Date(
        end.getFullYear(),
        end.getMonth(),
        1
      );

    while (
      cursor <=
      finalMonth
    ) {
      const year =
        cursor.getFullYear();

      const month =
        cursor.getMonth();

      const amount =
        payments
          .filter(
            (payment) => {
              const date =
                new Date(
                  payment.paymentDate
                );

              return (
                date.getFullYear() ===
                  year &&
                date.getMonth() ===
                  month
              );
            }
          )
          .reduce(
            (
              sum,
              payment
            ) =>
              sum +
              payment.amount,
            0
          );

      data.push({
        date:
          `${year}-${String(
            month + 1
          ).padStart(
            2,
            "0"
          )}`,

        label:
          new Intl.DateTimeFormat(
            "en-IN",
            {
              month:
                "short",
            }
          ).format(
            cursor
          ),

        amount,
      });

      cursor.setMonth(
        cursor.getMonth() +
          1
      );
    }

    return data;
  }

  const data:
    RevenueDay[] = [];

  const cursor =
    new Date(start);

  while (
    cursor <= end
  ) {
    const dateString =
      toLocalDateString(
        cursor
      );

    const amount =
      payments
        .filter(
          (payment) =>
            getLocalDateFromDateTime(
              payment.paymentDate
            ) ===
            dateString
        )
        .reduce(
          (
            sum,
            payment
          ) =>
            sum +
            payment.amount,
          0
        );

    data.push({
      date:
        dateString,

      label:
        range ===
        "This Month"
          ? new Intl.DateTimeFormat(
              "en-IN",
              {
                day:
                  "numeric",
              }
            ).format(
              cursor
            )
          : new Intl.DateTimeFormat(
              "en-IN",
              {
                day:
                  "2-digit",
                month:
                  "short",
              }
            ).format(
              cursor
            ),

      amount,
    });

    cursor.setDate(
      cursor.getDate() +
        1
    );
  }

  return data;
}

function isDateOnlyInRange(
  value: string,
  start: Date,
  end: Date
) {
  const date =
    parseDateOnly(
      value
    );

  return (
    date >= start &&
    date <= end
  );
}

function isDateTimeInRange(
  value: string,
  start: Date,
  end: Date
) {
  const date =
    new Date(value);

  const localDate =
    startOfDay(date);

  return (
    localDate >= start &&
    localDate <= end
  );
}

function getLocalDateFromDateTime(
  value: string
) {
  return toLocalDateString(
    new Date(value)
  );
}

function parseDateOnly(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function startOfDay(
  value: Date
) {
  const date =
    new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
}

function toLocalDateString(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function getLocalDateString() {
  return toLocalDateString(
    new Date()
  );
}

function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    }
  ).format(date);
}

function currency(
  value: number
) {
  return `₹${value.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    }
  )}`;
}

function csvValue(
  value: string
) {
  return `"${value.replace(
    /"/g,
    '""'
  )}"`;
}