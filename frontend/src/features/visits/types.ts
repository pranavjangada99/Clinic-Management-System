export type VisitStatus =
  | "Waiting"
  | "In Progress"
  | "Completed";

export interface Medicine {
  id: number;
  name: string;
  potency: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Visit {
  id: number;
  patientId: number;
  patientName: string;
  uhid: string;

  date: string;
  time: string;

  doctor: string;

  chiefComplaints: string;
  symptoms: string;
  diagnosis: string;
  clinicalNotes: string;

  medicines: Medicine[];

  advice: string;
  followUpDate: string;

  status: VisitStatus;
}