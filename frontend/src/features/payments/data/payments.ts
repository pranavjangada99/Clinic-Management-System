import type { Payment } from "../types";

export const payments: Payment[] = [
  {
    id: 1,

    receiptNumber: "REC-2026-0001",

    billId: 1,
    billNumber: "INV-2026-0001",

    patientId: 1,
    patientName: "Amit Shah",
    uhid: "SMHC-0001",

    date: "2026-08-01",

    amount: 500,

    method: "UPI",

    reference: "UPI123456",

    notes: "",
  },

  {
    id: 2,

    receiptNumber: "REC-2026-0002",

    billId: 2,
    billNumber: "INV-2026-0002",

    patientId: 2,
    patientName: "Neha Patel",
    uhid: "SMHC-0002",

    date: "2026-08-01",

    amount: 400,

    method: "Cash",

    reference: "",

    notes: "Partial payment",
  },
];