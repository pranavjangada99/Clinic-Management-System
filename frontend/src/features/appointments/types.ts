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
  patientName: string;
  uhid: string;
  date: string;
  time: string;
  type: AppointmentType;
  doctor: string;
  reason: string;
  status: AppointmentStatus;
}