export type AppointmentStatus =
  | "Scheduled"
  | "Waiting"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type AppointmentType =
  | "New Consultation"
  | "Follow-up"
  | "Review";

export interface Appointment {
  id: number;
  patientId: number;

  patientUhid: string;
  patientName: string;
  patientMobile: string;

  appointmentDate: string;
  appointmentTime: string;

  type: AppointmentType;
  doctor: string;
  reason: string | null;
  status: AppointmentStatus;

  createdAt: string;
  updatedAt: string;
}