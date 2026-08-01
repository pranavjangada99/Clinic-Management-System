export type PatientGender = "Male" | "Female" | "Other";

export type PatientStatus = "Active" | "Follow-up" | "Inactive";

export interface Patient {
  id: number;
  uhid: string;
  name: string;
  age: number;
  gender: PatientGender;
  mobile: string;
  lastVisit: string;
  status: PatientStatus;
}