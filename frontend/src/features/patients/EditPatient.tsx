import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardPlus,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

interface Patient {
  id: number;
  uhid: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  bloodGroup: string | null;
  referredBy: string | null;
  notes: string | null;
  status: string;
}

interface PatientForm {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  address: string;
  city: string;
  pincode: string;
  bloodGroup: string;
  referredBy: string;
  status: string;
}

const API_URL = "/patients";

const emptyForm: PatientForm = {
  fullName: "",
  mobile: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  address: "",
  city: "",
  pincode: "",
  bloodGroup: "",
  referredBy: "",
  status: "Active",
};

export default function EditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setLoadError("Invalid patient.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiFetch(
          `${API_URL}/${patientId}`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load patient."
          );
        }

        const data: Patient =
          await response.json();

        setPatient(data);

        setForm({
          fullName: data.name,
          mobile: data.mobile,
          dateOfBirth: data.dateOfBirth,
          age: String(data.age),
          gender: data.gender,
          address: data.address ?? "",
          city: data.city ?? "",
          pincode: data.pinCode ?? "",
          bloodGroup: data.bloodGroup ?? "",

          // Uses the real ReferredBy database field
          referredBy: data.referredBy ?? "",

          status: data.status,
        });
      } catch (error) {
        console.error(
          "Failed to load patient:",
          error
        );

        setLoadError(
          "Unable to load this patient. Make sure the clinic server is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const updateField = (
    field: keyof PatientForm,
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
  };

  const handleDateOfBirth = (
    value: string
  ) => {
    updateField("dateOfBirth", value);

    if (!value) {
      updateField("age", "");
      return;
    }

    updateField(
      "age",
      String(calculateAge(value))
    );
  };

  const validate = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!form.fullName.trim()) {
      newErrors.fullName =
        "Patient name is required.";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(form.mobile)
    ) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number.";
    }

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth =
        "Date of birth is required.";
    } else {
      const dob = new Date(
        `${form.dateOfBirth}T00:00:00`
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dob > today) {
        newErrors.dateOfBirth =
          "Date of birth cannot be in the future.";
      }
    }

    if (!form.gender) {
      newErrors.gender =
        "Please select gender.";
    }

    if (
      form.pincode &&
      !/^\d{6}$/.test(form.pincode)
    ) {
      newErrors.pincode =
        "Enter a valid 6-digit pincode.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!patient || !validate()) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");

      const response = await apiFetch(
        `${API_URL}/${patient.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.fullName.trim(),

            dateOfBirth:
              form.dateOfBirth,

            gender: form.gender,

            mobile: form.mobile,

            alternateMobile:
              patient.alternateMobile,

            email: patient.email,

            address:
              form.address.trim() ||
              null,

            city:
              form.city.trim() || null,

            state: patient.state,

            pinCode:
              form.pincode || null,

            bloodGroup:
              form.bloodGroup || null,

            // Saves directly to ReferredBy
            referredBy:
              form.referredBy.trim() ||
              null,

            // Keep Notes separate
            notes: patient.notes,

            status: form.status,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to update patient.";

        try {
          const errorData =
            await response.json();

          if (
            typeof errorData ===
            "string"
          ) {
            message = errorData;
          } else if (
            errorData?.title
          ) {
            message =
              errorData.title;
          }
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      navigate(
        `/patients/${patient.id}`
      );
    } catch (error) {
      console.error(
        "Failed to update patient:",
        error
      );

      if (error instanceof TypeError) {
        setSaveError(
          "Cannot connect to the clinic server. Make sure the backend is running."
        );
      } else if (
        error instanceof Error
      ) {
        setSaveError(error.message);
      } else {
        setSaveError(
          "Something went wrong while updating the patient."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-900">
          Loading patient...
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Reading patient information
          from the clinic database.
        </p>
      </div>
    );
  }

  if (loadError || !patient) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Patient not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {loadError ||
            "The patient record you're trying to edit doesn't exist."}
        </p>

        <div className="mt-6">
          <AppButton
            onClick={() =>
              navigate("/patients")
            }
          >
            Back to Patients
          </AppButton>
        </div>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/patients/${patient.id}`
              )
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back to patient"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-blue-600">
              {patient.uhid}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Edit Patient
            </h1>

            <p className="mt-1 text-slate-500">
              Update {patient.name}'s
              registration information.
            </p>
          </div>
        </div>

        <div className="hidden gap-3 sm:flex">
          <AppButton
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={() =>
              navigate(
                `/patients/${patient.id}`
              )
            }
          >
            Cancel
          </AppButton>

          <AppButton
            type="submit"
            disabled={isSaving}
            leftIcon={
              <Save className="h-4 w-4" />
            }
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </AppButton>
        </div>
      </div>

      {/* Save Error */}

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      {/* Personal Information */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="text-sm text-slate-500">
              Basic details about the
              patient.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Full Name */}

          <div className="lg:col-span-2">
            <label
              className={labelClass}
            >
              Full Name{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              value={form.fullName}
              onChange={(event) =>
                updateField(
                  "fullName",
                  event.target.value
                )
              }
              className={inputClass}
            />

            {errors.fullName && (
              <p className="mt-2 text-xs text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Mobile */}

          <div>
            <label
              className={labelClass}
            >
              Mobile Number{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={form.mobile}
                onChange={(event) =>
                  updateField(
                    "mobile",
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                inputMode="numeric"
                className={`${inputClass} pl-11`}
              />
            </div>

            {errors.mobile && (
              <p className="mt-2 text-xs text-red-600">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Date of Birth */}

          <div>
            <label
              className={labelClass}
            >
              Date of Birth{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              value={
                form.dateOfBirth
              }
              max={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                handleDateOfBirth(
                  event.target.value
                )
              }
              className={inputClass}
            />

            {errors.dateOfBirth && (
              <p className="mt-2 text-xs text-red-600">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Age */}

          <div>
            <label
              className={labelClass}
            >
              Age
            </label>

            <input
              value={form.age}
              readOnly
              className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
            />
          </div>

          {/* Gender */}

          <div>
            <label
              className={labelClass}
            >
              Gender{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={form.gender}
              onChange={(event) =>
                updateField(
                  "gender",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {errors.gender && (
              <p className="mt-2 text-xs text-red-600">
                {errors.gender}
              </p>
            )}
          </div>

          {/* Status */}

          <div>
            <label
              className={labelClass}
            >
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="Active">
                Active
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Contact Information */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="text-sm text-slate-500">
              Patient's address and
              location.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Address */}

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Address
            </label>

            <textarea
              value={form.address}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* City */}

          <div>
            <label
              className={labelClass}
            >
              City
            </label>

            <input
              value={form.city}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          {/* Pincode */}

          <div>
            <label
              className={labelClass}
            >
              Pincode
            </label>

            <input
              value={form.pincode}
              onChange={(event) =>
                updateField(
                  "pincode",
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              inputMode="numeric"
              className={inputClass}
            />

            {errors.pincode && (
              <p className="mt-2 text-xs text-red-600">
                {errors.pincode}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Additional Information */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ClipboardPlus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Patient Information
            </h2>

            <p className="text-sm text-slate-500">
              Additional registration
              details.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Blood Group */}

          <div>
            <label
              className={labelClass}
            >
              Blood Group
            </label>

            <select
              value={
                form.bloodGroup
              }
              onChange={(event) =>
                updateField(
                  "bloodGroup",
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Select blood group
              </option>

              <option value="A+">
                A+
              </option>
              <option value="A-">
                A-
              </option>
              <option value="B+">
                B+
              </option>
              <option value="B-">
                B-
              </option>
              <option value="AB+">
                AB+
              </option>
              <option value="AB-">
                AB-
              </option>
              <option value="O+">
                O+
              </option>
              <option value="O-">
                O-
              </option>
            </select>
          </div>

          {/* Referred By */}

          <div>
            <label
              className={labelClass}
            >
              Referred By
            </label>

            <input
              value={
                form.referredBy
              }
              onChange={(event) =>
                updateField(
                  "referredBy",
                  event.target.value
                )
              }
              placeholder="Doctor, patient, Google, etc."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Mobile Actions */}

      <div className="grid grid-cols-2 gap-3 pb-4 sm:hidden">
        <AppButton
          type="button"
          variant="secondary"
          disabled={isSaving}
          onClick={() =>
            navigate(
              `/patients/${patient.id}`
            )
          }
        >
          Cancel
        </AppButton>

        <AppButton
          type="submit"
          disabled={isSaving}
          leftIcon={
            <Save className="h-4 w-4" />
          }
        >
          {isSaving
            ? "Saving..."
            : "Save Changes"}
        </AppButton>
      </div>
    </form>
  );
}

function calculateAge(
  dateOfBirth: string
) {
  const dob = new Date(
    `${dateOfBirth}T00:00:00`
  );

  const today = new Date();

  let age =
    today.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    today.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() <
        dob.getDate())
  ) {
    age--;
  }

  return Math.max(age, 0);
}