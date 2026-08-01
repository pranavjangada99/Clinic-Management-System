import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import { patients } from "@/features/patients/data/patients";

import { visits } from "./data/visits";

import type {
  Medicine,
  VisitStatus,
} from "./types";

interface ConsultationForm {
  patientId: string;

  chiefComplaints: string;
  symptoms: string;
  diagnosis: string;
  clinicalNotes: string;

  advice: string;
  followUpDate: string;

  status: VisitStatus;
}

const emptyMedicine = (
  id: number
): Medicine => ({
  id,
  name: "",
  potency: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export default function Consultation() {
  const navigate = useNavigate();

  const { visitId } = useParams();

  const [searchParams] =
    useSearchParams();

  const existingVisit =
    visits.find(
      (visit) =>
        visit.id === Number(visitId)
    );

  const requestedPatientId =
    searchParams.get("patientId") ?? "";

  const initialPatientId =
    existingVisit
      ? String(existingVisit.patientId)
      : patients.some(
            (patient) =>
              String(patient.id) ===
              requestedPatientId
          )
        ? requestedPatientId
        : "";

  const [form, setForm] =
    useState<ConsultationForm>({
      patientId: initialPatientId,

      chiefComplaints:
        existingVisit?.chiefComplaints ??
        "",

      symptoms:
        existingVisit?.symptoms ?? "",

      diagnosis:
        existingVisit?.diagnosis ?? "",

      clinicalNotes:
        existingVisit?.clinicalNotes ??
        "",

      advice:
        existingVisit?.advice ?? "",

      followUpDate:
        existingVisit?.followUpDate ??
        "",

      status:
        existingVisit?.status ===
        "Completed"
          ? "In Progress"
          : existingVisit?.status ??
            "In Progress",
    });

  const [medicines, setMedicines] =
    useState<Medicine[]>(
      existingVisit?.medicines.length
        ? existingVisit.medicines
        : [emptyMedicine(1)]
    );

  const [errors, setErrors] =
    useState<Record<string, string>>(
      {}
    );

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (patient) =>
            String(patient.id) ===
            form.patientId
        ),
      [form.patientId]
    );

  const updateField = (
    field: keyof ConsultationForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  };

  const updateMedicine = (
    id: number,
    field: keyof Omit<
      Medicine,
      "id"
    >,
    value: string
  ) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      )
    );
  };

  const addMedicine = () => {
    const nextId =
      medicines.length === 0
        ? 1
        : Math.max(
            ...medicines.map(
              (medicine) =>
                medicine.id
            )
          ) + 1;

    setMedicines((current) => [
      ...current,
      emptyMedicine(nextId),
    ]);
  };

  const removeMedicine = (
    id: number
  ) => {
    if (medicines.length === 1) {
      setMedicines([
        emptyMedicine(1),
      ]);

      return;
    }

    setMedicines((current) =>
      current.filter(
        (medicine) =>
          medicine.id !== id
      )
    );
  };

  const validate = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!form.patientId) {
      newErrors.patientId =
        "Please select a patient.";
    }

    if (
      !form.chiefComplaints.trim()
    ) {
      newErrors.chiefComplaints =
        "Chief complaint is required.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  const handleComplete = () => {
    if (!validate()) {
      return;
    }

    console.log(
      "Consultation ready:",
      {
        ...form,
        medicines:
          medicines.filter(
            (medicine) =>
              medicine.name.trim()
          ),
      }
    );

    /*
      Backend phase:
      POST/PUT visit here.
    */

    navigate("/visits");
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const textareaClass =
    "w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/visits")
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Stethoscope className="h-4 w-4" />
              Consultation
            </div>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {existingVisit
                ? "Continue Consultation"
                : "New Consultation"}
            </h1>

            <p className="mt-1 text-slate-500">
              Record clinical information
              and prescription.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton
            variant="secondary"
            onClick={() =>
              navigate("/visits")
            }
            leftIcon={
              <Save className="h-4 w-4" />
            }
          >
            Save Draft
          </AppButton>

          <AppButton
            onClick={handleComplete}
            leftIcon={
              <ClipboardCheck className="h-4 w-4" />
            }
          >
            Complete Visit
          </AppButton>
        </div>
      </div>

      {/* Patient */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Patient"
          description="Patient attending this consultation."
        />

        <div className="mt-6">
          <label className={labelClass}>
            Select Patient{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <select
            value={form.patientId}
            disabled={Boolean(
              existingVisit
            )}
            onChange={(event) =>
              updateField(
                "patientId",
                event.target.value
              )
            }
            className={`${inputClass} ${
              existingVisit
                ? "cursor-not-allowed bg-slate-50"
                : ""
            }`}
          >
            <option value="">
              Select patient
            </option>

            {patients.map(
              (patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} —{" "}
                  {patient.uhid}
                </option>
              )
            )}
          </select>

          {errors.patientId && (
            <p className="mt-2 text-xs text-red-600">
              {errors.patientId}
            </p>
          )}

          {selectedPatient && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-2xl bg-blue-50/60 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">
                {
                  selectedPatient.name
                }
              </span>

              <span className="text-slate-500">
                {
                  selectedPatient.uhid
                }
              </span>

              <span className="text-slate-500">
                {
                  selectedPatient.age
                }{" "}
                years •{" "}
                {
                  selectedPatient.gender
                }
              </span>

              <span className="text-slate-500">
                {
                  selectedPatient.mobile
                }
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Clinical */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={
            <Stethoscope className="h-5 w-5" />
          }
          title="Clinical Assessment"
          description="Record complaints, symptoms and assessment."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className={labelClass}>
              Chief Complaints{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <textarea
              value={
                form.chiefComplaints
              }
              onChange={(event) =>
                updateField(
                  "chiefComplaints",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Main complaints reported by the patient..."
              className={
                textareaClass
              }
            />

            {errors.chiefComplaints && (
              <p className="mt-2 text-xs text-red-600">
                {
                  errors.chiefComplaints
                }
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Symptoms / Findings
            </label>

            <textarea
              value={form.symptoms}
              onChange={(event) =>
                updateField(
                  "symptoms",
                  event.target.value
                )
              }
              rows={5}
              placeholder="Symptoms, observations, examination findings..."
              className={
                textareaClass
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              Diagnosis / Assessment
            </label>

            <textarea
              value={form.diagnosis}
              onChange={(event) =>
                updateField(
                  "diagnosis",
                  event.target.value
                )
              }
              rows={5}
              placeholder="Clinical assessment or diagnosis..."
              className={
                textareaClass
              }
            />
          </div>

          <div className="lg:col-span-2">
            <label className={labelClass}>
              Clinical Notes
            </label>

            <textarea
              value={
                form.clinicalNotes
              }
              onChange={(event) =>
                updateField(
                  "clinicalNotes",
                  event.target.value
                )
              }
              rows={5}
              placeholder="Detailed consultation notes..."
              className={
                textareaClass
              }
            />
          </div>
        </div>
      </section>

      {/* Prescription */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            icon={
              <FileText className="h-5 w-5" />
            }
            title="Prescription"
            description="Add medicines prescribed during this consultation."
          />

          <AppButton
            type="button"
            variant="secondary"
            onClick={addMedicine}
            leftIcon={
              <Plus className="h-4 w-4" />
            }
          >
            Add Medicine
          </AppButton>
        </div>

        <div className="mt-6 space-y-4">
          {medicines.map(
            (medicine, index) => (
              <div
                key={medicine.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">
                    Medicine{" "}
                    {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeMedicine(
                        medicine.id
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Medicine Name
                    </label>

                    <input
                      value={
                        medicine.name
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "name",
                          event.target
                            .value
                        )
                      }
                      placeholder="Medicine name"
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
                      Potency / Strength
                    </label>

                    <input
                      value={
                        medicine.potency
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "potency",
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. 30C"
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
                      Dose
                    </label>

                    <input
                      value={
                        medicine.dose
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "dose",
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. 4 pills"
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
                      Frequency
                    </label>

                    <input
                      value={
                        medicine.frequency
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "frequency",
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. Twice daily"
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
                      Duration
                    </label>

                    <input
                      value={
                        medicine.duration
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "duration",
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. 7 days"
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
                      Instructions
                    </label>

                    <input
                      value={
                        medicine.instructions
                      }
                      onChange={(
                        event
                      ) =>
                        updateMedicine(
                          medicine.id,
                          "instructions",
                          event.target
                            .value
                        )
                      }
                      placeholder="Additional instructions"
                      className={
                        inputClass
                      }
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Advice */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          title="Advice & Follow-up"
          description="Record advice and next follow-up."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div>
            <label className={labelClass}>
              Advice
            </label>

            <textarea
              value={form.advice}
              onChange={(event) =>
                updateField(
                  "advice",
                  event.target.value
                )
              }
              rows={4}
              placeholder="Advice for the patient..."
              className={
                textareaClass
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              Follow-up Date
            </label>

            <input
              type="date"
              value={
                form.followUpDate
              }
              onChange={(event) =>
                updateField(
                  "followUpDate",
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />
          </div>
        </div>
      </section>

      {/* Bottom */}

      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <AppButton
          variant="secondary"
          onClick={() =>
            navigate("/visits")
          }
        >
          Save Draft
        </AppButton>

        <AppButton
          onClick={handleComplete}
          leftIcon={
            <ClipboardCheck className="h-4 w-4" />
          }
        >
          Complete Visit
        </AppButton>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}