import type { Visit } from "../types";

export const visits: Visit[] = [
  {
    id: 1,
    patientId: 1,
    patientName: "Amit Shah",
    uhid: "SMHC-0001",

    date: "2026-08-01",
    time: "09:00",

    doctor: "Dr. Pranav",

    chiefComplaints:
      "Headache, tiredness and disturbed sleep.",

    symptoms:
      "Headache mainly in the evening with general fatigue.",

    diagnosis:
      "Clinical evaluation completed.",

    clinicalNotes:
      "Patient reports symptoms for approximately one week. Appetite normal.",

    medicines: [
      {
        id: 1,
        name: "Medicine A",
        potency: "30C",
        dose: "4 pills",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Take as advised.",
      },
      {
        id: 2,
        name: "Medicine B",
        potency: "200C",
        dose: "4 pills",
        frequency: "Once daily",
        duration: "3 days",
        instructions: "Take as advised.",
      },
    ],

    advice:
      "Maintain adequate hydration and regular sleep.",

    followUpDate: "2026-08-08",

    status: "Completed",
  },

  {
    id: 2,
    patientId: 2,
    patientName: "Neha Patel",
    uhid: "SMHC-0002",

    date: "2026-08-01",
    time: "09:30",

    doctor: "Dr. Pranav",

    chiefComplaints:
      "Cold and throat discomfort.",

    symptoms: "",

    diagnosis: "",

    clinicalNotes: "",

    medicines: [],

    advice: "",

    followUpDate: "",

    status: "Waiting",
  },

  {
    id: 3,
    patientId: 3,
    patientName: "Rajesh Jain",
    uhid: "SMHC-0003",

    date: "2026-08-01",
    time: "10:15",

    doctor: "Dr. Pranav",

    chiefComplaints:
      "Follow-up consultation.",

    symptoms:
      "Previous symptoms improving.",

    diagnosis: "",

    clinicalNotes:
      "Patient reports improvement since previous visit.",

    medicines: [],

    advice: "",

    followUpDate: "",

    status: "In Progress",
  },
];