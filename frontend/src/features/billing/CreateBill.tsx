import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Receipt,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type { BillItem } from "./types";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  status: string;
}

const PATIENTS_API =
  "http://localhost:5230/api/patients";

const BILLS_API =
  "http://localhost:5230/api/bills";

const currency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createItem = (
  id: number
): BillItem => ({
  id,
  description: "",
  quantity: 1,
  rate: 0,
});

export default function CreateBill() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const requestedPatientId =
    searchParams.get("patientId") ?? "";

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [patientId, setPatientId] =
    useState("");

  const [items, setItems] =
    useState<BillItem[]>([
      {
        id: 1,
        description:
          "Consultation Fee",
        quantity: 1,
        rate: 500,
      },
    ]);

  const [discount, setDiscount] =
    useState(0);

  const [paid, setPaid] =
    useState(0);

  const [errors, setErrors] =
    useState<Record<string, string>>(
      {}
    );

  const [
    isLoadingPatients,
    setIsLoadingPatients,
  ] = useState(true);

  const [
    patientLoadError,
    setPatientLoadError,
  ] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  /*
   * Load real patients
   */

  useEffect(() => {
    const loadPatients =
      async () => {
        try {
          setIsLoadingPatients(
            true
          );

          setPatientLoadError("");

          const response =
            await fetch(
              PATIENTS_API
            );

          if (!response.ok) {
            throw new Error(
              "Unable to load patients."
            );
          }

          const data: Patient[] =
            await response.json();

          setPatients(data);

          if (
            requestedPatientId &&
            data.some(
              (patient) =>
                String(
                  patient.id
                ) ===
                requestedPatientId
            )
          ) {
            setPatientId(
              requestedPatientId
            );
          }
        } catch (error) {
          console.error(
            "Failed to load patients:",
            error
          );

          setPatientLoadError(
            "Unable to load patients. Make sure the clinic server is running."
          );
        } finally {
          setIsLoadingPatients(
            false
          );
        }
      };

    loadPatients();
  }, [requestedPatientId]);

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (patient) =>
            String(patient.id) ===
            patientId
        ),
      [patients, patientId]
    );

  /*
   * Calculations shown in UI.
   *
   * Backend will calculate these
   * again when saving.
   */

  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          item.rate,
      0
    );

  const safeDiscount =
    Math.max(
      0,
      Math.min(
        discount,
        subtotal
      )
    );

  const total =
    subtotal - safeDiscount;

  const safePaid =
    Math.max(
      0,
      Math.min(paid, total)
    );

  const balance =
    total - safePaid;

  /*
   * Item editing
   */

  const updateItem = (
    id: number,
    field: keyof Omit<
      BillItem,
      "id"
    >,
    value: string
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (
          field === "quantity" ||
          field === "rate"
        ) {
          return {
            ...item,

            [field]:
              Math.max(
                0,
                Number(value) || 0
              ),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );

    if (errors.items) {
      setErrors((current) => ({
        ...current,
        items: "",
      }));
    }

    if (saveError) {
      setSaveError("");
    }
  };

  const addItem = () => {
    const nextId =
      Math.max(
        0,
        ...items.map(
          (item) => item.id
        )
      ) + 1;

    setItems((current) => [
      ...current,
      createItem(nextId),
    ]);
  };

  const removeItem = (
    id: number
  ) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  /*
   * Validation
   */

  const validate = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!patientId) {
      newErrors.patientId =
        "Please select a patient.";
    }

    const invalidItem =
      items.some(
        (item) =>
          !item.description.trim() ||
          item.quantity < 1 ||
          item.rate < 0
      );

    if (invalidItem) {
      newErrors.items =
        "Every bill item must have a description, quantity of at least 1 and a valid rate.";
    }

    if (items.length === 0) {
      newErrors.items =
        "Add at least one bill item.";
    }

    if (
      discount < 0 ||
      discount > subtotal
    ) {
      newErrors.discount =
        "Discount cannot be greater than subtotal.";
    }

    if (
      paid < 0 ||
      paid > total
    ) {
      newErrors.paid =
        "Paid amount cannot be greater than bill total.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  /*
   * Save bill
   */

  const handleSave =
    async () => {
      if (
        !validate() ||
        !selectedPatient
      ) {
        return;
      }

      try {
        setIsSaving(true);
        setSaveError("");

        const response =
          await fetch(
            BILLS_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                patientId:
                  selectedPatient.id,

                billDate:
                  getToday(),

                discount:
                  safeDiscount,

                paid:
                  safePaid,

                items:
                  items.map(
                    (item) => ({
                      description:
                        item.description.trim(),

                      quantity:
                        item.quantity,

                      rate:
                        item.rate,
                    })
                  ),
              }),
            }
          );

        if (!response.ok) {
          const message =
            await response.text();

          throw new Error(
            message ||
              "Unable to create bill."
          );
        }

        const createdBill =
          await response.json();

        /*
         * Open the newly
         * created bill.
         */

        navigate(
          `/billing/${createdBill.id}`
        );
      } catch (error) {
        console.error(
          "Failed to create bill:",
          error
        );

        setSaveError(
          error instanceof Error
            ? error.message
            : "Unable to save bill."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/billing"
              )
            }
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Receipt className="h-4 w-4" />

              Billing
            </div>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Create Bill
            </h1>

            <p className="mt-1 text-slate-500">
              Create a new patient
              invoice.
            </p>
          </div>
        </div>

        <AppButton
          onClick={handleSave}
          disabled={
            isSaving ||
            isLoadingPatients
          }
          leftIcon={
            <Save className="h-4 w-4" />
          }
        >
          {isSaving
            ? "Saving..."
            : "Save Bill"}
        </AppButton>
      </div>

      {/* Save Error */}

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Patient"
        />

        <div className="mt-6">
          <label
            className={labelClass}
          >
            Select Patient *
          </label>

          {patientLoadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {patientLoadError}
            </div>
          ) : (
            <select
              value={patientId}
              disabled={
                isLoadingPatients
              }
              onChange={(
                event
              ) => {
                setPatientId(
                  event.target
                    .value
                );

                setErrors(
                  (current) => ({
                    ...current,
                    patientId: "",
                  })
                );

                setSaveError("");
              }}
              className={
                inputClass
              }
            >
              <option value="">
                {isLoadingPatients
                  ? "Loading patients..."
                  : "Select patient"}
              </option>

              {patients.map(
                (patient) => (
                  <option
                    key={
                      patient.id
                    }
                    value={
                      patient.id
                    }
                  >
                    {
                      patient.name
                    }{" "}
                    —{" "}
                    {
                      patient.uhid
                    }
                  </option>
                )
              )}
            </select>
          )}

          {errors.patientId && (
            <p className="mt-2 text-xs text-red-600">
              {
                errors.patientId
              }
            </p>
          )}

          {selectedPatient && (
            <div className="mt-4 rounded-2xl bg-blue-50/60 p-4">
              <p className="font-semibold text-slate-900">
                {
                  selectedPatient.name
                }
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {
                  selectedPatient.uhid
                }{" "}
                •{" "}
                {
                  selectedPatient.age
                }{" "}
                years •{" "}
                {
                  selectedPatient.gender
                }{" "}
                •{" "}
                {
                  selectedPatient.mobile
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Items */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            icon={
              <Receipt className="h-5 w-5" />
            }
            title="Bill Items"
          />

          <AppButton
            variant="secondary"
            onClick={addItem}
            disabled={isSaving}
            leftIcon={
              <Plus className="h-4 w-4" />
            }
          >
            Add Item
          </AppButton>
        </div>

        <div className="mt-6 space-y-4">
          {items.map(
            (item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">
                    Item{" "}
                    {index + 1}
                  </p>

                  <button
                    type="button"
                    disabled={
                      items.length ===
                        1 ||
                      isSaving
                    }
                    onClick={() =>
                      removeItem(
                        item.id
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_0.8fr_1fr_1fr]">
                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Description
                    </label>

                    <input
                      value={
                        item.description
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          item.id,
                          "description",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Consultation fee"
                      className={
                        inputClass
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Qty
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        item.quantity
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          item.id,
                          "quantity",
                          event
                            .target
                            .value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Rate
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        item.rate
                      }
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          item.id,
                          "rate",
                          event
                            .target
                            .value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Amount
                    </label>

                    <div className="flex h-12 items-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-900">
                      {currency(
                        item.quantity *
                          item.rate
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {errors.items && (
            <p className="text-sm text-red-600">
              {errors.items}
            </p>
          )}
        </div>
      </section>

      {/* Totals */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="ml-auto max-w-md space-y-4">
          <TotalRow
            label="Subtotal"
            value={currency(
              subtotal
            )}
          />

          <div className="flex items-center justify-between gap-6">
            <label className="text-sm text-slate-500">
              Discount
            </label>

            <input
              type="number"
              min="0"
              max={subtotal}
              step="0.01"
              value={discount}
              disabled={isSaving}
              onChange={(
                event
              ) => {
                setDiscount(
                  Math.max(
                    0,
                    Number(
                      event.target
                        .value
                    ) || 0
                  )
                );

                setErrors(
                  (current) => ({
                    ...current,
                    discount: "",
                  })
                );
              }}
              className="h-11 w-36 rounded-xl border border-slate-200 px-3 text-right text-sm outline-none focus:border-blue-300"
            />
          </div>

          {errors.discount && (
            <p className="text-right text-xs text-red-600">
              {errors.discount}
            </p>
          )}

          <div className="border-t border-slate-200 pt-4">
            <TotalRow
              label="Total"
              value={currency(
                total
              )}
              strong
            />
          </div>

          {/* Payment */}

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between gap-6">
              <label className="text-sm text-slate-500">
                Amount Paid
              </label>

              <input
                type="number"
                min="0"
                max={total}
                step="0.01"
                value={paid}
                disabled={isSaving}
                onChange={(
                  event
                ) => {
                  setPaid(
                    Math.max(
                      0,
                      Number(
                        event
                          .target
                          .value
                      ) || 0
                    )
                  );

                  setErrors(
                    (current) => ({
                      ...current,
                      paid: "",
                    })
                  );
                }}
                className="h-11 w-36 rounded-xl border border-slate-200 px-3 text-right text-sm outline-none focus:border-blue-300"
              />
            </div>

            {errors.paid && (
              <p className="mt-2 text-right text-xs text-red-600">
                {errors.paid}
              </p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <TotalRow
              label="Balance"
              value={currency(
                balance
              )}
            />
          </div>

          {/* Status preview */}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">
              Payment Status
            </span>

            <PaymentStatus
              total={total}
              paid={safePaid}
            />
          </div>
        </div>
      </section>

      {/* Bottom Save */}

      <div className="flex justify-end pb-6">
        <AppButton
          onClick={handleSave}
          disabled={
            isSaving ||
            isLoadingPatients
          }
          leftIcon={
            <Save className="h-4 w-4" />
          }
        >
          {isSaving
            ? "Saving..."
            : "Save Bill"}
        </AppButton>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h2 className="font-semibold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
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
            ? "text-2xl font-bold text-slate-900"
            : "font-semibold text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

function PaymentStatus({
  total,
  paid,
}: {
  total: number;
  paid: number;
}) {
  if (
    total === 0 ||
    paid >= total
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Paid
      </span>
    );
  }

  if (paid > 0) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Partially Paid
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
      Unpaid
    </span>
  );
}