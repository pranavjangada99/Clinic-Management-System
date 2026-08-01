import { useState } from "react";
import {
  Building2,
  Database,
  FileText,
  Hash,
  LockKeyhole,
  Receipt,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import AppButton from "@/components/ui/app/AppButton";

type SettingsTab =
  | "Clinic"
  | "Doctor"
  | "Consultation"
  | "Billing"
  | "Numbering"
  | "Backup"
  | "Security";

const tabs: {
  id: SettingsTab;
  icon: React.ReactNode;
}[] = [
  {
    id: "Clinic",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: "Doctor",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: "Consultation",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  {
    id: "Billing",
    icon: <Receipt className="h-4 w-4" />,
  },
  {
    id: "Numbering",
    icon: <Hash className="h-4 w-4" />,
  },
  {
    id: "Backup",
    icon: <Database className="h-4 w-4" />,
  },
  {
    id: "Security",
    icon: <LockKeyhole className="h-4 w-4" />,
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("Clinic");

  const [saved, setSaved] =
    useState(false);

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      2500
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            System
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Configure your clinic and
            application preferences.
          </p>
        </div>

        <AppButton
          onClick={handleSave}
          leftIcon={
            <Save className="h-4 w-4" />
          }
        >
          Save Changes
        </AppButton>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
          Settings saved locally for this
          UI preview.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* Tabs */}

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto xl:block xl:space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition xl:w-full ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.id}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}

        <main>
          {activeTab === "Clinic" && (
            <ClinicSettings />
          )}

          {activeTab === "Doctor" && (
            <DoctorSettings />
          )}

          {activeTab ===
            "Consultation" && (
            <ConsultationSettings />
          )}

          {activeTab === "Billing" && (
            <BillingSettings />
          )}

          {activeTab === "Numbering" && (
            <NumberingSettings />
          )}

          {activeTab === "Backup" && (
            <BackupSettings />
          )}

          {activeTab === "Security" && (
            <SecuritySettings />
          )}
        </main>
      </div>
    </div>
  );
}

function ClinicSettings() {
  return (
    <SettingsCard
      icon={
        <Building2 className="h-5 w-5" />
      }
      title="Clinic Profile"
      description="Information displayed across invoices, prescriptions and receipts."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Clinic Name"
          defaultValue="Shree Mahavir Homoeopathic Clinic"
          wide
        />

        <Field
          label="Phone Number"
          defaultValue="9876543210"
        />

        <Field
          label="Email"
          type="email"
          placeholder="clinic@example.com"
        />

        <Field
          label="Address"
          placeholder="Clinic address"
          wide
        />

        <Field
          label="City"
          defaultValue="Nashik"
        />

        <Field
          label="State"
          defaultValue="Maharashtra"
        />

        <Field
          label="PIN Code"
          placeholder="422001"
        />
      </div>
    </SettingsCard>
  );
}

function DoctorSettings() {
  return (
    <SettingsCard
      icon={
        <UserRound className="h-5 w-5" />
      }
      title="Doctor Details"
      description="Doctor information used on prescriptions and clinical documents."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Doctor Name"
          defaultValue="Dr. Pranav"
        />

        <Field
          label="Qualification"
          placeholder="BHMS / MD"
        />

        <Field
          label="Registration Number"
          placeholder="Medical registration number"
        />

        <Field
          label="Specialisation"
          defaultValue="Homoeopathy"
        />

        <Field
          label="Phone Number"
          placeholder="Mobile number"
        />

        <Field
          label="Email"
          type="email"
          placeholder="doctor@example.com"
        />
      </div>
    </SettingsCard>
  );
}

function ConsultationSettings() {
  return (
    <SettingsCard
      icon={
        <Stethoscope className="h-5 w-5" />
      }
      title="Consultation Settings"
      description="Default clinical and appointment preferences."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Default Consultation Fee"
          type="number"
          defaultValue="500"
        />

        <Field
          label="Default Follow-up Fee"
          type="number"
          defaultValue="300"
        />

        <Field
          label="Appointment Duration (minutes)"
          type="number"
          defaultValue="30"
        />

        <Field
          label="Default Follow-up After (days)"
          type="number"
          defaultValue="15"
        />
      </div>

      <div className="mt-6 space-y-3">
        <ToggleRow
          title="Enable appointment reminders"
          description="Prepare the system for patient reminder functionality."
          defaultChecked
        />

        <ToggleRow
          title="Allow same-day appointments"
          description="Allow appointments to be created for the current date."
          defaultChecked
        />
      </div>
    </SettingsCard>
  );
}

function BillingSettings() {
  return (
    <SettingsCard
      icon={
        <Receipt className="h-5 w-5" />
      }
      title="Billing & Receipt"
      description="Configure invoice and payment preferences."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Currency"
          defaultValue="INR (₹)"
          readOnly
        />

        <Field
          label="Receipt Footer"
          defaultValue="Thank you for your payment."
        />

        <Field
          label="Invoice Footer"
          defaultValue="Thank you for visiting Shree Mahavir Homoeopathic Clinic."
          wide
        />
      </div>

      <div className="mt-6 space-y-3">
        <ToggleRow
          title="Allow partial payments"
          description="Patients can pay part of an invoice and retain an outstanding balance."
          defaultChecked
        />

        <ToggleRow
          title="Print receipt after payment"
          description="Show receipt immediately after recording payment."
          defaultChecked
        />

        <ToggleRow
          title="Show outstanding balance"
          description="Display previous outstanding dues during billing."
          defaultChecked
        />
      </div>
    </SettingsCard>
  );
}

function NumberingSettings() {
  return (
    <SettingsCard
      icon={
        <Hash className="h-5 w-5" />
      }
      title="Numbering"
      description="Configure identifiers generated by the system."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Patient UHID Prefix"
          defaultValue="SMHC"
        />

        <Field
          label="Next Patient Number"
          type="number"
          defaultValue="6"
        />

        <Field
          label="Invoice Prefix"
          defaultValue="INV-2026"
        />

        <Field
          label="Next Invoice Number"
          type="number"
          defaultValue="4"
        />

        <Field
          label="Receipt Prefix"
          defaultValue="REC-2026"
        />

        <Field
          label="Next Receipt Number"
          type="number"
          defaultValue="3"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <p className="font-semibold text-slate-900">
          Preview
        </p>

        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <span>
            UHID:{" "}
            <strong>SMHC-0006</strong>
          </span>

          <span>
            Invoice:{" "}
            <strong>
              INV-2026-0004
            </strong>
          </span>

          <span>
            Receipt:{" "}
            <strong>
              REC-2026-0003
            </strong>
          </span>
        </div>
      </div>
    </SettingsCard>
  );
}

function BackupSettings() {
  return (
    <SettingsCard
      icon={
        <Database className="h-5 w-5" />
      }
      title="Backup & Data"
      description="Data protection controls will be connected when we build the backend."
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-900">
          Backend not connected yet
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          The application is currently
          using mock frontend data. No real
          patient information should be
          entered until secure storage,
          authentication and backups are
          implemented.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ActionCard
          icon={
            <Database className="h-5 w-5" />
          }
          title="Create Backup"
          description="Create a manual encrypted database backup."
          button="Backup Now"
        />

        <ActionCard
          icon={
            <FileText className="h-5 w-5" />
          }
          title="Export Data"
          description="Export clinic data for authorised administrative use."
          button="Export"
        />
      </div>

      <div className="mt-6 space-y-3">
        <ToggleRow
          title="Automatic daily backup"
          description="Automatically create a secure backup every day."
          defaultChecked
        />

        <ToggleRow
          title="Keep multiple backup copies"
          description="Maintain historical backups instead of overwriting the previous backup."
          defaultChecked
        />
      </div>
    </SettingsCard>
  );
}

function SecuritySettings() {
  return (
    <SettingsCard
      icon={
        <LockKeyhole className="h-5 w-5" />
      }
      title="Security"
      description="Access and privacy settings for clinic data."
    >
      <div className="space-y-3">
        <ToggleRow
          title="Require login"
          description="Users must authenticate before accessing clinic data."
          defaultChecked
        />

        <ToggleRow
          title="Automatic screen lock"
          description="Lock the application after a period of inactivity."
          defaultChecked
        />

        <ToggleRow
          title="Audit activity"
          description="Keep a record of important changes made inside the system."
          defaultChecked
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field
          label="Auto-lock After (minutes)"
          type="number"
          defaultValue="15"
        />

        <Field
          label="Backup Encryption"
          defaultValue="Enabled"
          readOnly
        />
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="font-semibold text-emerald-900">
              Privacy-first architecture
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              When we start the backend,
              patient records will not be
              stored in these frontend
              TypeScript files. We will
              implement proper database
              storage, authentication,
              access control and backup
              protection.
            </p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  wide = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide ? "md:col-span-2" : ""
      }
    >
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition read-only:bg-slate-50 read-only:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div>
        <p className="font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 shrink-0 accent-blue-600"
      />
    </label>
  );
}

function ActionCard({
  icon,
  title,
  description,
  button,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={() =>
          console.log(
            `${button} will be connected to the backend later.`
          )
        }
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {button}
      </button>
    </div>
  );
}