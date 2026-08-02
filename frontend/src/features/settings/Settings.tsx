import { useEffect, useRef, useState } from "react";

import {
  Building2,
  Database,
  Hash,
  LockKeyhole,
  Receipt,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Download,
  HardDriveDownload,
  RefreshCcw,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import AppButton from "@/components/ui/app/AppButton";
import { apiFetch } from "@/lib/api";

type SettingsTab =
  | "Clinic"
  | "Doctor"
  | "Consultation"
  | "Billing"
  | "Numbering"
  | "Backup"
  | "Security";

interface ClinicSettingsData {
  id: number;

  // Clinic
  clinicName: string;
  clinicPhone: string;
  clinicEmail: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;

  // Doctor
  doctorName: string;
  qualification: string;
  registrationNumber: string;
  specialisation: string;
  doctorPhone: string;
  doctorEmail: string;

  // Consultation
  defaultConsultationFee: number;
  defaultFollowUpFee: number;
  appointmentDurationMinutes: number;
  defaultFollowUpDays: number;
  enableAppointmentReminders: boolean;
  allowSameDayAppointments: boolean;

  // Billing
  currency: string;
  receiptFooter: string;
  invoiceFooter: string;
  allowPartialPayments: boolean;
  printReceiptAfterPayment: boolean;
  showOutstandingBalance: boolean;

  // Numbering
  patientUhidPrefix: string;
  nextPatientNumber: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  receiptPrefix: string;
  nextReceiptNumber: number;

  createdAt?: string;
  updatedAt?: string;
}

const currentYear = new Date().getFullYear();

const emptySettings: ClinicSettingsData = {
  id: 0,

  clinicName: "",
  clinicPhone: "",
  clinicEmail: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",

  doctorName: "",
  qualification: "",
  registrationNumber: "",
  specialisation: "",
  doctorPhone: "",
  doctorEmail: "",

  defaultConsultationFee: 500,
  defaultFollowUpFee: 300,
  appointmentDurationMinutes: 30,
  defaultFollowUpDays: 15,
  enableAppointmentReminders: true,
  allowSameDayAppointments: true,

  currency: "INR",
  receiptFooter: "Thank you for your payment.",
  invoiceFooter: "Thank you for visiting.",
  allowPartialPayments: true,
  printReceiptAfterPayment: true,
  showOutstandingBalance: true,

  patientUhidPrefix: "SMHC",
  nextPatientNumber: 1,

  invoicePrefix: `INV-${currentYear}`,
  nextInvoiceNumber: 1,

  receiptPrefix: `REC-${currentYear}`,
  nextReceiptNumber: 1,
};

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
  const [activeTab, setActiveTab] = useState<SettingsTab>("Clinic");

  const [settings, setSettings] = useState<ClinicSettingsData>(emptySettings);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await apiFetch("/clinic-settings");

        if (!response.ok) {
          throw new Error("Unable to load settings.");
        }

        const data: ClinicSettingsData = await response.json();

        if (!cancelled) {
          setSettings({
            ...emptySettings,
            ...data,
          });
        }
      } catch (loadError) {
        console.error("Failed to load settings:", loadError);

        if (!cancelled) {
          setError("Unable to load clinic settings.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = <K extends keyof ClinicSettingsData>(
    field: K,
    value: ClinicSettingsData[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaved(false);
      setError("");

      const response = await apiFetch("/clinic-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message || "Unable to save settings.");
      }

      const savedSettings: ClinicSettingsData = await response.json();

      setSettings({
        ...emptySettings,
        ...savedSettings,
      });

      setSaved(true);

      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      console.error("Failed to save settings:", saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save clinic settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">System</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Configure your clinic and application preferences.
          </p>
        </div>

        <AppButton
          onClick={handleSave}
          disabled={isLoading || isSaving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </AppButton>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto xl:block xl:space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        <main>
          {activeTab === "Clinic" && (
            <ClinicSettings
              settings={settings}
              updateSetting={updateSetting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "Doctor" && (
            <DoctorSettings
              settings={settings}
              updateSetting={updateSetting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "Consultation" && (
            <ConsultationSettings
              settings={settings}
              updateSetting={updateSetting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "Billing" && (
            <BillingSettings
              settings={settings}
              updateSetting={updateSetting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "Numbering" && (
            <NumberingSettings
              settings={settings}
              updateSetting={updateSetting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "Backup" && <BackupSettings />}

          {activeTab === "Security" && <SecuritySettings />}
        </main>
      </div>
    </div>
  );
}

interface ProfileSettingsProps {
  settings: ClinicSettingsData;

  updateSetting: <K extends keyof ClinicSettingsData>(
    field: K,
    value: ClinicSettingsData[K],
  ) => void;

  isLoading: boolean;
}

function ClinicSettings({
  settings,
  updateSetting,
  isLoading,
}: ProfileSettingsProps) {
  return (
    <SettingsCard
      icon={<Building2 className="h-5 w-5" />}
      title="Clinic Profile"
      description="Information displayed across invoices, prescriptions and receipts."
    >
      {isLoading ? (
        <LoadingSettings />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Clinic Name"
            value={settings.clinicName}
            onChange={(event) =>
              updateSetting("clinicName", event.target.value)
            }
            wide
          />

          <Field
            label="Phone Number"
            value={settings.clinicPhone}
            onChange={(event) =>
              updateSetting("clinicPhone", event.target.value)
            }
          />

          <Field
            label="Email"
            type="email"
            value={settings.clinicEmail}
            onChange={(event) =>
              updateSetting("clinicEmail", event.target.value)
            }
          />

          <Field
            label="Address"
            value={settings.address}
            onChange={(event) => updateSetting("address", event.target.value)}
            wide
          />

          <Field
            label="City"
            value={settings.city}
            onChange={(event) => updateSetting("city", event.target.value)}
          />

          <Field
            label="State"
            value={settings.state}
            onChange={(event) => updateSetting("state", event.target.value)}
          />

          <Field
            label="PIN Code"
            value={settings.pinCode}
            onChange={(event) => updateSetting("pinCode", event.target.value)}
          />
        </div>
      )}
    </SettingsCard>
  );
}

function DoctorSettings({
  settings,
  updateSetting,
  isLoading,
}: ProfileSettingsProps) {
  return (
    <SettingsCard
      icon={<UserRound className="h-5 w-5" />}
      title="Doctor Details"
      description="Doctor information used on prescriptions and clinical documents."
    >
      {isLoading ? (
        <LoadingSettings />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Doctor Name"
            value={settings.doctorName}
            onChange={(event) =>
              updateSetting("doctorName", event.target.value)
            }
          />

          <Field
            label="Qualification"
            value={settings.qualification}
            onChange={(event) =>
              updateSetting("qualification", event.target.value)
            }
          />

          <Field
            label="Registration Number"
            value={settings.registrationNumber}
            onChange={(event) =>
              updateSetting("registrationNumber", event.target.value)
            }
          />

          <Field
            label="Specialisation"
            value={settings.specialisation}
            onChange={(event) =>
              updateSetting("specialisation", event.target.value)
            }
          />

          <Field
            label="Phone Number"
            value={settings.doctorPhone}
            onChange={(event) =>
              updateSetting("doctorPhone", event.target.value)
            }
          />

          <Field
            label="Email"
            type="email"
            value={settings.doctorEmail}
            onChange={(event) =>
              updateSetting("doctorEmail", event.target.value)
            }
          />
        </div>
      )}
    </SettingsCard>
  );
}

function ConsultationSettings({
  settings,
  updateSetting,
  isLoading,
}: ProfileSettingsProps) {
  return (
    <SettingsCard
      icon={<Stethoscope className="h-5 w-5" />}
      title="Consultation Settings"
      description="Default clinical and appointment preferences."
    >
      {isLoading ? (
        <LoadingSettings />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Default Consultation Fee"
              type="number"
              min="0"
              value={settings.defaultConsultationFee}
              onChange={(event) =>
                updateSetting(
                  "defaultConsultationFee",
                  Number(event.target.value) || 0,
                )
              }
            />

            <Field
              label="Default Follow-up Fee"
              type="number"
              min="0"
              value={settings.defaultFollowUpFee}
              onChange={(event) =>
                updateSetting(
                  "defaultFollowUpFee",
                  Number(event.target.value) || 0,
                )
              }
            />

            <Field
              label="Appointment Duration (minutes)"
              type="number"
              min="1"
              value={settings.appointmentDurationMinutes}
              onChange={(event) =>
                updateSetting(
                  "appointmentDurationMinutes",
                  Number(event.target.value) || 1,
                )
              }
            />

            <Field
              label="Default Follow-up After (days)"
              type="number"
              min="0"
              value={settings.defaultFollowUpDays}
              onChange={(event) =>
                updateSetting(
                  "defaultFollowUpDays",
                  Number(event.target.value) || 0,
                )
              }
            />
          </div>

          <div className="mt-6 space-y-3">
            <ToggleRow
              title="Enable appointment reminders"
              description="Prepare the system for patient reminder functionality."
              checked={settings.enableAppointmentReminders}
              onChange={(checked) =>
                updateSetting("enableAppointmentReminders", checked)
              }
            />

            <ToggleRow
              title="Allow same-day appointments"
              description="Allow appointments to be created for the current date."
              checked={settings.allowSameDayAppointments}
              onChange={(checked) =>
                updateSetting("allowSameDayAppointments", checked)
              }
            />
          </div>
        </>
      )}
    </SettingsCard>
  );
}

function BillingSettings({
  settings,
  updateSetting,
  isLoading,
}: ProfileSettingsProps) {
  return (
    <SettingsCard
      icon={<Receipt className="h-5 w-5" />}
      title="Billing & Receipt"
      description="Configure invoice and payment preferences."
    >
      {isLoading ? (
        <LoadingSettings />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Currency" value={settings.currency} readOnly />

            <Field
              label="Receipt Footer"
              value={settings.receiptFooter}
              onChange={(event) =>
                updateSetting("receiptFooter", event.target.value)
              }
            />

            <Field
              label="Invoice Footer"
              value={settings.invoiceFooter}
              onChange={(event) =>
                updateSetting("invoiceFooter", event.target.value)
              }
              wide
            />
          </div>

          <div className="mt-6 space-y-3">
            <ToggleRow
              title="Allow partial payments"
              description="Patients can pay part of an invoice and retain an outstanding balance."
              checked={settings.allowPartialPayments}
              onChange={(checked) =>
                updateSetting("allowPartialPayments", checked)
              }
            />

            <ToggleRow
              title="Print receipt after payment"
              description="Show receipt immediately after recording payment."
              checked={settings.printReceiptAfterPayment}
              onChange={(checked) =>
                updateSetting("printReceiptAfterPayment", checked)
              }
            />

            <ToggleRow
              title="Show outstanding balance"
              description="Display previous outstanding dues during billing."
              checked={settings.showOutstandingBalance}
              onChange={(checked) =>
                updateSetting("showOutstandingBalance", checked)
              }
            />
          </div>
        </>
      )}
    </SettingsCard>
  );
}

function NumberingSettings({
  settings,
  updateSetting,
  isLoading,
}: ProfileSettingsProps) {
  const formatNumber = (value: number) => String(value).padStart(4, "0");

  return (
    <SettingsCard
      icon={<Hash className="h-5 w-5" />}
      title="Numbering"
      description="Configure identifiers generated by the system."
    >
      {isLoading ? (
        <LoadingSettings />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Patient UHID Prefix"
              value={settings.patientUhidPrefix}
              onChange={(event) =>
                updateSetting("patientUhidPrefix", event.target.value)
              }
            />

            <Field
              label="Next Patient Number"
              type="number"
              min="1"
              value={settings.nextPatientNumber}
              onChange={(event) =>
                updateSetting(
                  "nextPatientNumber",
                  Math.max(1, Number(event.target.value) || 1),
                )
              }
            />

            <Field
              label="Invoice Prefix"
              value={settings.invoicePrefix}
              onChange={(event) =>
                updateSetting("invoicePrefix", event.target.value)
              }
            />

            <Field
              label="Next Invoice Number"
              type="number"
              min="1"
              value={settings.nextInvoiceNumber}
              onChange={(event) =>
                updateSetting(
                  "nextInvoiceNumber",
                  Math.max(1, Number(event.target.value) || 1),
                )
              }
            />

            <Field
              label="Receipt Prefix"
              value={settings.receiptPrefix}
              onChange={(event) =>
                updateSetting("receiptPrefix", event.target.value)
              }
            />

            <Field
              label="Next Receipt Number"
              type="number"
              min="1"
              value={settings.nextReceiptNumber}
              onChange={(event) =>
                updateSetting(
                  "nextReceiptNumber",
                  Math.max(1, Number(event.target.value) || 1),
                )
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <p className="font-semibold text-slate-900">Preview</p>

            <p className="mt-1 text-sm text-slate-500">
              These are the next identifiers that will be generated.
            </p>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <PreviewNumber
                label="Patient UHID"
                value={`${settings.patientUhidPrefix || "SMHC"}-${formatNumber(
                  settings.nextPatientNumber,
                )}`}
              />

              <PreviewNumber
                label="Invoice"
                value={`${settings.invoicePrefix || "INV"}-${formatNumber(
                  settings.nextInvoiceNumber,
                )}`}
              />

              <PreviewNumber
                label="Receipt"
                value={`${settings.receiptPrefix || "REC"}-${formatNumber(
                  settings.nextReceiptNumber,
                )}`}
              />
            </div>
          </div>
        </>
      )}
    </SettingsCard>
  );
}

function PreviewNumber({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-400">{label}</p>

      <strong className="mt-1 block text-slate-900">{value}</strong>
    </div>
  );
}

interface BackupItem {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
}

function BackupSettings() {
  const [backups, setBackups] = useState<BackupItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);

  const [isRestoring, setIsRestoring] = useState(false);

  const [message, setMessage] = useState("");

  const [backupError, setBackupError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      setBackupError("");

      const response = await apiFetch("/backup");

      if (!response.ok) {
        throw new Error("Unable to load backups.");
      }

      const data: BackupItem[] = await response.json();

      setBackups(data);
    } catch (error) {
      console.error("Failed to load backups:", error);

      setBackupError("Unable to load backup history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchBackups = async () => {
      try {
        const response = await apiFetch("/backup");
        if (!response.ok) {
          throw new Error("Unable to load backups.");
        }

        const data: BackupItem[] = await response.json();

        if (!cancelled) {
          setBackups(data);
        }
      } catch (error) {
        console.error("Failed to load backups:", error);

        if (!cancelled) {
          setBackupError("Unable to load backup history.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchBackups();

    return () => {
      cancelled = true;
    };
  }, []);

  const createBackup = async () => {
    try {
      setIsCreating(true);
      setMessage("");
      setBackupError("");

      const response = await apiFetch("/backup", {
        method: "POST",
      });

      if (!response.ok) {
        const text = await response.text();

        throw new Error(text || "Unable to create backup.");
      }

      setMessage("Backup created successfully.");

      await loadBackups();
    } catch (error) {
      console.error("Failed to create backup:", error);

      setBackupError(
        error instanceof Error ? error.message : "Unable to create backup.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBackup = async (backup: BackupItem) => {
    const confirmed = window.confirm(
      `Delete backup "${backup.fileName}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setBackupError("");

      const response = await apiFetch(
        `/backup/${encodeURIComponent(backup.fileName)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(text || "Unable to delete backup.");
      }

      setMessage("Backup deleted.");

      await loadBackups();
    } catch (error) {
      console.error("Failed to delete backup:", error);

      setBackupError(
        error instanceof Error ? error.message : "Unable to delete backup.",
      );
    }
  };

  const downloadBackup = async (
  backup: BackupItem,
) => {
  try {
    setBackupError("");

    const response = await apiFetch(
      `/backup/download/${encodeURIComponent(
        backup.fileName,
      )}`,
    );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        text ||
          "Unable to download backup.",
      );
    }

    const blob =
      await response.blob();

    const objectUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = objectUrl;
    link.download =
      backup.fileName;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      objectUrl,
    );
  } catch (error) {
    console.error(
      "Failed to download backup:",
      error,
    );

    setBackupError(
      error instanceof Error
        ? error.message
        : "Unable to download backup.",
    );
  }
};

  const handleRestoreFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".db")) {
      setBackupError("Please select a .db backup file.");

      return;
    }

    const confirmed = window.confirm(
      "Restore this database backup?\n\n" +
        "Current clinic data will be replaced with the data from this backup.\n\n" +
        "A safety backup of the current database will be created automatically before restoring.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRestoring(true);
      setMessage("");
      setBackupError("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await apiFetch("/backup/restore", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Unable to restore backup.");
      }

      let safetyBackup = "";

      try {
        const result = JSON.parse(responseText);

        safetyBackup = result.safetyBackup ?? "";
      } catch {
        // Response parsing is
        // optional here.
      }

      setMessage(
        safetyBackup
          ? `Database restored successfully. Safety backup: ${safetyBackup}`
          : "Database restored successfully.",
      );

      await loadBackups();
    } catch (error) {
      console.error("Failed to restore backup:", error);

      setBackupError(
        error instanceof Error ? error.message : "Unable to restore backup.",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SettingsCard
      icon={<Database className="h-5 w-5" />}
      title="Backup & Restore"
      description="Create and restore local backups of your clinic database."
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".db"
        className="hidden"
        onChange={handleRestoreFile}
      />

      {/* Important notice */}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="font-semibold text-blue-900">
              Local database backups
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Backups are stored locally on this clinic computer. Restoring a
              backup replaces the current clinic database. A safety backup is
              created automatically before every restore.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          disabled={isCreating || isRestoring}
          onClick={createBackup}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {isCreating ? (
              <RefreshCcw className="h-5 w-5 animate-spin" />
            ) : (
              <HardDriveDownload className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {isCreating ? "Creating backup..." : "Create Backup"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Save a copy of the current clinic database.
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={isCreating || isRestoring}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-amber-200 hover:bg-amber-50/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            {isRestoring ? (
              <RefreshCcw className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {isRestoring ? "Restoring..." : "Restore Backup"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Restore clinic data from a previous .db backup.
            </p>
          </div>
        </button>
      </div>

      {/* Messages */}

      {message && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {backupError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {backupError}
        </div>
      )}

      {/* History */}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Backup History</h3>

            <p className="mt-1 text-sm text-slate-500">
              Backups currently stored on this computer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBackups()}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh backups"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 py-10 text-center">
            <RefreshCcw className="mx-auto h-5 w-5 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">Loading backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
            <Database className="mx-auto h-7 w-7 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">No backups yet</p>

            <p className="mt-1 text-sm text-slate-500">
              Create your first database backup above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.fileName}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Database className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {backup.fileName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatBackupDate(backup.createdAt)}
                      {" • "}
                      {formatFileSize(backup.sizeBytes)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => downloadBackup(backup)}
                    className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBackup(backup)}
                    className="flex h-9 items-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restore warning */}

      <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <p className="text-sm leading-6 text-amber-800">
          Restore should only be used when you need to return the clinic to an
          earlier database state. Patient records, appointments, visits, bills
          and payments created after that backup will no longer appear after
          restoring.
        </p>
      </div>
    </SettingsCard>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatBackupDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChanging, setIsChanging] = useState(false);

  const [securityMessage, setSecurityMessage] = useState("");

  const [securityError, setSecurityError] = useState("");

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSecurityMessage("");
    setSecurityError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("Please complete all password fields.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New password and confirmation do not match.");

      return;
    }

    try {
      setIsChanging(true);

      const response = await apiFetch("/auth/change-password", {
        method: "POST",

        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const text = await response.text();

        let message = "Unable to change password.";

        try {
          const parsed = JSON.parse(text);

          message =
            typeof parsed === "string"
              ? parsed
              : (parsed.detail ?? parsed.title ?? message);
        } catch {
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSecurityMessage("Password changed successfully.");
    } catch (error) {
      setSecurityError(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <SettingsCard
      icon={<LockKeyhole className="h-5 w-5" />}
      title="Security"
      description="Manage access and account security for this clinic."
    >
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="font-semibold text-emerald-900">
              Login protection enabled
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Clinic screens and backend APIs require an authenticated clinic
              account.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div>
          <h3 className="font-semibold text-slate-900">Change Password</h3>

          <p className="mt-1 text-sm text-slate-500">
            Update the password used to access this clinic.
          </p>
        </div>

        <form onSubmit={changePassword} className="mt-5 space-y-5">
          <Field
            label="Current Password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />

            <Field
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <p className="text-xs leading-5 text-slate-400">
            Password must contain at least 8 characters, one uppercase letter,
            one lowercase letter and one number.
          </p>

          {securityMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {securityMessage}
            </div>
          )}

          {securityError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {securityError}
            </div>
          )}

          <button
            type="submit"
            disabled={isChanging}
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChanging ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-7">
        <h3 className="font-semibold text-slate-900">Security Features</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SecurityFeature
            title="Password Hashing"
            description="Passwords are not stored as plain text."
          />

          <SecurityFeature
            title="Secure Session"
            description="Authentication uses an HTTP-only cookie."
          />

          <SecurityFeature
            title="Protected APIs"
            description="Clinic API requests require authentication."
          />

          <SecurityFeature
            title="12-hour Session"
            description="Sessions automatically expire and use sliding renewal."
          />
        </div>
      </div>
    </SettingsCard>
  );
}

function SecurityFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSettings() {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-slate-500">Loading settings...</p>
    </div>
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
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-7">{children}</div>
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
    <div className={wide ? "md:col-span-2" : ""}>
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

interface ToggleRowProps {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  defaultChecked = false,
}: ToggleRowProps) {
  const controlled = checked !== undefined;

  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div>
        <p className="font-medium text-slate-900">{title}</p>

        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <input
        type="checkbox"
        {...(controlled
          ? {
              checked,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                onChange?.(event.target.checked),
            }
          : {
              defaultChecked,
            })}
        className="h-5 w-5 shrink-0 accent-blue-600"
      />
    </label>
  );
}
