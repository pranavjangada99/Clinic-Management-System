import { useState } from "react";
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
import { patients } from "./data/patients";
import type { PatientGender } from "./types";

interface PatientForm {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  age: string;
  gender: PatientGender | "";
  address: string;
  city: string;
  pincode: string;
  bloodGroup: string;
  referredBy: string;
}

export default function EditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const patient = patients.find(
    (item) => item.id === Number(patientId)
  );

  const [form, setForm] = useState<PatientForm>(() => ({
    fullName: patient?.name ?? "",
    mobile: patient?.mobile ?? "",
    dateOfBirth: "",
    age: patient ? String(patient.age) : "",
    gender: patient?.gender ?? "",
    address: "",
    city: "",
    pincode: "",
    bloodGroup: "",
    referredBy: "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!patient) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Patient not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The patient record you're trying to edit doesn't exist.
        </p>

        <div className="mt-6">
          <AppButton onClick={() => navigate("/patients")}>
            Back to Patients
          </AppButton>
        </div>
      </div>
    );
  }

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
  };

  const handleDateOfBirth = (value: string) => {
    updateField("dateOfBirth", value);

    if (!value) {
      updateField("age", "");
      return;
    }

    const dob = new Date(`${value}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference =
      today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    updateField(
      "age",
      age >= 0 ? String(age) : ""
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName =
        "Patient name is required.";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number.";
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

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    console.log("Patient ready to update:", {
      id: patient.id,
      uhid: patient.uhid,
      ...form,
    });

    /*
      Actual database update will be implemented
      when the .NET API is connected.
    */

    navigate(`/patients/${patient.id}`);
  };

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
              navigate(`/patients/${patient.id}`)
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
              Update {patient.name}'s registration
              information.
            </p>
          </div>
        </div>

        <div className="hidden gap-3 sm:flex">
          <AppButton
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(`/patients/${patient.id}`)
            }
          >
            Cancel
          </AppButton>

          <AppButton
            type="submit"
            leftIcon={
              <Save className="h-4 w-4" />
            }
          >
            Save Changes
          </AppButton>
        </div>
      </div>

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
              Basic details about the patient.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Name */}

          <div className="lg:col-span-2">
            <label className={labelClass}>
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
              placeholder="Enter patient's full name"
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
            <label className={labelClass}>
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
                placeholder="9876543210"
                className={`${inputClass} pl-11`}
              />
            </div>

            {errors.mobile && (
              <p className="mt-2 text-xs text-red-600">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* DOB */}

          <div>
            <label className={labelClass}>
              Date of Birth
            </label>

            <input
              type="date"
              value={form.dateOfBirth}
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
          </div>

          {/* Age */}

          <div>
            <label className={labelClass}>
              Age
            </label>

            <input
              value={form.age}
              readOnly
              placeholder="Calculated from DOB"
              className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
            />

            {!form.dateOfBirth && (
              <p className="mt-2 text-xs text-slate-400">
                Select date of birth to calculate
                age.
              </p>
            )}
          </div>

          {/* Gender */}

          <div>
            <label className={labelClass}>
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
        </div>
      </section>

      {/* Contact */}

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
              Patient's address and location.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
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
              placeholder="House, street, area..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className={labelClass}>
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
              placeholder="City"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
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
              placeholder="422001"
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

      {/* Additional */}

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
              Additional registration details.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Blood Group
            </label>

            <select
              value={form.bloodGroup}
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
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Referred By
            </label>

            <input
              value={form.referredBy}
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

      {/* Mobile buttons */}

      <div className="grid grid-cols-2 gap-3 pb-4 sm:hidden">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(`/patients/${patient.id}`)
          }
        >
          Cancel
        </AppButton>

        <AppButton
          type="submit"
          leftIcon={
            <Save className="h-4 w-4" />
          }
        >
          Save Changes
        </AppButton>
      </div>
    </form>
  );
}