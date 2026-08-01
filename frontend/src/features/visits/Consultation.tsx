import {
  useEffect,
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
  Loader2,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

import type {
  Medicine,
  VisitStatus,
} from "./types";

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

interface ApiMedicine {
  id: number;
  name: string;
  potency: string | null;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
}

interface ApiVisit {
  id: number;

  patientId: number;
  patientUhid: string;
  patientName: string;
  patientMobile: string;

  appointmentId: number | null;

  visitDate: string;
  visitTime: string;

  doctor: string;

  chiefComplaints: string;
  symptoms: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;

  advice: string | null;
  followUpDate: string | null;

  status: VisitStatus;

  medicines: ApiMedicine[];

  createdAt: string;
  updatedAt: string;
}

interface ConsultationForm {
  patientId: string;

  doctor: string;

  chiefComplaints: string;
  symptoms: string;
  diagnosis: string;
  clinicalNotes: string;

  advice: string;
  followUpDate: string;

  status: VisitStatus;
}

const PATIENTS_API =
  "http://localhost:5230/api/patients";

const VISITS_API =
  "http://localhost:5230/api/visits";

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

const emptyForm: ConsultationForm = {
  patientId: "",

  doctor: "Dr. Sunil Jangada",

  chiefComplaints: "",
  symptoms: "",
  diagnosis: "",
  clinicalNotes: "",

  advice: "",
  followUpDate: "",

  status: "In Progress",
};

export default function Consultation() {
  const navigate = useNavigate();

  const { visitId } = useParams();

  const [searchParams] =
    useSearchParams();

  const requestedPatientId =
    searchParams.get("patientId") ?? "";

  const requestedAppointmentId =
    searchParams.get("appointmentId");

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [form, setForm] =
    useState<ConsultationForm>(
      emptyForm
    );

  const [medicines, setMedicines] =
    useState<Medicine[]>([
      emptyMedicine(1),
    ]);

  const [currentVisitId, setCurrentVisitId] =
    useState<number | null>(
      visitId
        ? Number(visitId)
        : null
    );

  const [
    currentAppointmentId,
    setCurrentAppointmentId,
  ] = useState<number | null>(
    requestedAppointmentId
      ? Number(
          requestedAppointmentId
        )
      : null
  );

  const [errors, setErrors] =
    useState<Record<string, string>>(
      {}
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  /*
   * Load patients and, when editing,
   * load the existing visit.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const patientsResponse =
          await fetch(PATIENTS_API);

        if (!patientsResponse.ok) {
          throw new Error(
            "Unable to load patients."
          );
        }

        const patientData: Patient[] =
          await patientsResponse.json();

        setPatients(patientData);

        /*
         * Existing visit:
         * /visits/:visitId/consultation
         */
        if (visitId) {
          const visitResponse =
            await fetch(
              `${VISITS_API}/${visitId}`
            );

          if (!visitResponse.ok) {
            throw new Error(
              "Unable to load visit."
            );
          }

          const visit: ApiVisit =
            await visitResponse.json();

          setCurrentVisitId(
            visit.id
          );

          setCurrentAppointmentId(
            visit.appointmentId
          );

          setForm({
            patientId: String(
              visit.patientId
            ),

            doctor:
              visit.doctor,

            chiefComplaints:
              visit.chiefComplaints,

            symptoms:
              visit.symptoms ?? "",

            diagnosis:
              visit.diagnosis ?? "",

            clinicalNotes:
              visit.clinicalNotes ??
              "",

            advice:
              visit.advice ?? "",

            followUpDate:
              visit.followUpDate ??
              "",

            status:
              visit.status,
          });

          if (
            visit.medicines.length >
            0
          ) {
            setMedicines(
              visit.medicines.map(
                (medicine) => ({
                  id: medicine.id,

                  name:
                    medicine.name,

                  potency:
                    medicine.potency ??
                    "",

                  dose:
                    medicine.dose ??
                    "",

                  frequency:
                    medicine.frequency ??
                    "",

                  duration:
                    medicine.duration ??
                    "",

                  instructions:
                    medicine.instructions ??
                    "",
                })
              )
            );
          } else {
            setMedicines([
              emptyMedicine(1),
            ]);
          }

          return;
        }

        /*
         * New consultation.
         * Preselect patient when patientId
         * was supplied in the URL.
         */
        const patientExists =
          patientData.some(
            (patient) =>
              String(patient.id) ===
              requestedPatientId
          );

        setForm((current) => ({
          ...current,

          patientId:
            patientExists
              ? requestedPatientId
              : "",
        }));
      } catch (error) {
        console.error(
          "Failed to load consultation:",
          error
        );

        setLoadError(
          "Unable to load consultation data. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    visitId,
    requestedPatientId,
  ]);

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (patient) =>
            String(patient.id) ===
            form.patientId
        ),
      [
        patients,
        form.patientId,
      ]
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

    if (saveError) {
      setSaveError("");
    }

    if (saveMessage) {
      setSaveMessage("");
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

    if (saveMessage) {
      setSaveMessage("");
    }
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

    if (!form.doctor.trim()) {
      newErrors.doctor =
        "Doctor name is required.";
    }

    if (
      !form.chiefComplaints.trim()
    ) {
      newErrors.chiefComplaints =
        "Chief complaint is required.";
    }

    if (
      form.followUpDate &&
      form.followUpDate <
        getLocalDateString()
    ) {
      newErrors.followUpDate =
        "Follow-up date cannot be in the past.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  /*
   * Saves a new visit or updates the
   * existing visit.
   *
   * Returns the saved visit when successful.
   */
  const saveVisit =
    async (): Promise<ApiVisit | null> => {
      if (!validate()) {
        return null;
      }

      try {
        setIsSaving(true);
        setSaveError("");
        setSaveMessage("");

        const medicinePayload =
          medicines
            .filter(
              (medicine) =>
                medicine.name.trim()
            )
            .map(
              (medicine) => ({
                name:
                  medicine.name.trim(),

                potency:
                  cleanValue(
                    medicine.potency
                  ),

                dose:
                  cleanValue(
                    medicine.dose
                  ),

                frequency:
                  cleanValue(
                    medicine.frequency
                  ),

                duration:
                  cleanValue(
                    medicine.duration
                  ),

                instructions:
                  cleanValue(
                    medicine.instructions
                  ),
              })
            );

        let response: Response;

        /*
         * Existing visit -> PUT
         */
        if (currentVisitId) {
          response = await fetch(
            `${VISITS_API}/${currentVisitId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                doctor:
                  form.doctor.trim(),

                chiefComplaints:
                  form.chiefComplaints.trim(),

                symptoms:
                  cleanValue(
                    form.symptoms
                  ),

                diagnosis:
                  cleanValue(
                    form.diagnosis
                  ),

                clinicalNotes:
                  cleanValue(
                    form.clinicalNotes
                  ),

                advice:
                  cleanValue(
                    form.advice
                  ),

                followUpDate:
                  form.followUpDate ||
                  null,

                medicines:
                  medicinePayload,
              }),
            }
          );
        } else {
          /*
           * New visit -> POST
           */

          const now = new Date();

          response = await fetch(
            VISITS_API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                patientId:
                  Number(
                    form.patientId
                  ),

                appointmentId:
                  currentAppointmentId,

                visitDate:
                  getLocalDateString(),

                visitTime:
                  getLocalTimeString(
                    now
                  ),

                doctor:
                  form.doctor.trim(),

                chiefComplaints:
                  form.chiefComplaints.trim(),

                symptoms:
                  cleanValue(
                    form.symptoms
                  ),

                diagnosis:
                  cleanValue(
                    form.diagnosis
                  ),

                clinicalNotes:
                  cleanValue(
                    form.clinicalNotes
                  ),

                advice:
                  cleanValue(
                    form.advice
                  ),

                followUpDate:
                  form.followUpDate ||
                  null,

                medicines:
                  medicinePayload,
              }),
            }
          );
        }

        if (!response.ok) {
          const message =
            await readApiError(
              response
            );

          throw new Error(
            message ||
              "Unable to save consultation."
          );
        }

        const savedVisit: ApiVisit =
          await response.json();

        setCurrentVisitId(
          savedVisit.id
        );

        setCurrentAppointmentId(
          savedVisit.appointmentId
        );

        setForm((current) => ({
          ...current,
          status:
            savedVisit.status,
        }));

        /*
         * Replace temporary medicine IDs
         * with database IDs after saving.
         */
        if (
          savedVisit.medicines.length >
          0
        ) {
          setMedicines(
            savedVisit.medicines.map(
              (medicine) => ({
                id: medicine.id,

                name:
                  medicine.name,

                potency:
                  medicine.potency ??
                  "",

                dose:
                  medicine.dose ??
                  "",

                frequency:
                  medicine.frequency ??
                  "",

                duration:
                  medicine.duration ??
                  "",

                instructions:
                  medicine.instructions ??
                  "",
              })
            )
          );
        } else {
          setMedicines([
            emptyMedicine(1),
          ]);
        }

        return savedVisit;
      } catch (error) {
        console.error(
          "Failed to save consultation:",
          error
        );

        if (
          error instanceof TypeError
        ) {
          setSaveError(
            "Cannot connect to the clinic server. Make sure the backend is running."
          );
        } else if (
          error instanceof Error
        ) {
          setSaveError(
            error.message
          );
        } else {
          setSaveError(
            "Something went wrong while saving the consultation."
          );
        }

        return null;
      } finally {
        setIsSaving(false);
      }
    };

  const handleSaveDraft =
    async () => {
      const savedVisit =
        await saveVisit();

      if (!savedVisit) {
        return;
      }

      setSaveMessage(
        "Consultation saved successfully."
      );

      /*
       * Change the URL to the real visit
       * route after the first save.
       *
       * This prevents another POST if the
       * doctor continues editing.
       */
      navigate(
        `/visits/${savedVisit.id}/consultation`,
        {
          replace: true,
        }
      );
    };

  const handleComplete =
    async () => {
      const savedVisit =
        await saveVisit();

      if (!savedVisit) {
        return;
      }

      try {
        setIsSaving(true);
        setSaveError("");

        const response =
          await fetch(
            `${VISITS_API}/${savedVisit.id}/complete`,
            {
              method: "PATCH",
            }
          );

        if (!response.ok) {
          const message =
            await readApiError(
              response
            );

          throw new Error(
            message ||
              "Unable to complete visit."
          );
        }

        navigate(
          `/visits/${savedVisit.id}`
        );
      } catch (error) {
        console.error(
          "Failed to complete visit:",
          error
        );

        if (
          error instanceof TypeError
        ) {
          setSaveError(
            "Cannot connect to the clinic server. Make sure the backend is running."
          );
        } else if (
          error instanceof Error
        ) {
          setSaveError(
            error.message
          );
        } else {
          setSaveError(
            "The visit was saved, but could not be marked as completed."
          );
        }
      } finally {
        setIsSaving(false);
      }
    };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

        <p className="mt-4 font-semibold text-slate-900">
          Loading consultation...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Unable to open consultation
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError}
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/visits")
            }
          >
            Back to Visits
          </AppButton>
        </div>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const textareaClass =
    "w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  const isExistingVisit =
    currentVisitId !== null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              navigate("/visits")
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Stethoscope className="h-4 w-4" />
              Consultation
            </div>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {isExistingVisit
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
            disabled={isSaving}
            onClick={
              handleSaveDraft
            }
            leftIcon={
              isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
          >
            {isSaving
              ? "Saving..."
              : "Save Draft"}
          </AppButton>

          <AppButton
            disabled={isSaving}
            onClick={
              handleComplete
            }
            leftIcon={
              isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )
            }
          >
            {isSaving
              ? "Saving..."
              : "Complete Visit"}
          </AppButton>
        </div>
      </div>

      {/* Messages */}

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      {saveMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {saveMessage}
        </div>
      )}

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
            disabled={
              isExistingVisit ||
              Boolean(
                requestedPatientId
              )
            }
            onChange={(event) =>
              updateField(
                "patientId",
                event.target.value
              )
            }
            className={`${inputClass} ${
              isExistingVisit ||
              requestedPatientId
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

          <div className="mt-5">
            <label className={labelClass}>
              Doctor{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              value={form.doctor}
              onChange={(event) =>
                updateField(
                  "doctor",
                  event.target.value
                )
              }
              placeholder="Doctor name"
              className={inputClass}
            />

            {errors.doctor && (
              <p className="mt-2 text-xs text-red-600">
                {errors.doctor}
              </p>
            )}
          </div>
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
            disabled={isSaving}
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
                    disabled={isSaving}
                    onClick={() =>
                      removeMedicine(
                        medicine.id
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
              min={getLocalDateString()}
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

            {errors.followUpDate && (
              <p className="mt-2 text-xs text-red-600">
                {
                  errors.followUpDate
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Actions */}

      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <AppButton
          variant="secondary"
          disabled={isSaving}
          onClick={
            handleSaveDraft
          }
          leftIcon={
            isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
        >
          {isSaving
            ? "Saving..."
            : "Save Draft"}
        </AppButton>

        <AppButton
          disabled={isSaving}
          onClick={
            handleComplete
          }
          leftIcon={
            isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4" />
            )
          }
        >
          {isSaving
            ? "Saving..."
            : "Complete Visit"}
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

function cleanValue(
  value: string
) {
  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function getLocalDateString() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalTimeString(
  date: Date
) {
  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  const seconds = String(
    date.getSeconds()
  ).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

async function readApiError(
  response: Response
) {
  try {
    const contentType =
      response.headers.get(
        "content-type"
      );

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      const data =
        await response.json();

      if (
        typeof data === "string"
      ) {
        return data;
      }

      if (data?.message) {
        return data.message;
      }

      if (data?.title) {
        return data.title;
      }

      return "";
    }

    return await response.text();
  } catch {
    return "";
  }
}