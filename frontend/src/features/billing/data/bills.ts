import type { Bill } from "../types";

export const bills: Bill[] = [
  {
    id: 1,
    billNumber: "INV-2026-0001",

    patientId: 1,
    patientName: "Amit Shah",
    uhid: "SMHC-0001",

    date: "2026-08-01",

    items: [
      {
        id: 1,
        description: "Consultation Fee",
        quantity: 1,
        rate: 500,
      },
    ],

    subtotal: 500,
    discount: 0,
    total: 500,
    paid: 500,
    balance: 0,

    status: "Paid",
  },

  {
    id: 2,
    billNumber: "INV-2026-0002",

    patientId: 2,
    patientName: "Neha Patel",
    uhid: "SMHC-0002",

    date: "2026-08-01",

    items: [
      {
        id: 1,
        description: "Consultation Fee",
        quantity: 1,
        rate: 500,
      },
      {
        id: 2,
        description: "Medicine Charges",
        quantity: 1,
        rate: 300,
      },
    ],

    subtotal: 800,
    discount: 100,
    total: 700,
    paid: 400,
    balance: 300,

    status: "Partially Paid",
  },

  {
    id: 3,
    billNumber: "INV-2026-0003",

    patientId: 3,
    patientName: "Rajesh Jain",
    uhid: "SMHC-0003",

    date: "2026-07-31",

    items: [
      {
        id: 1,
        description: "Follow-up Consultation",
        quantity: 1,
        rate: 300,
      },
    ],

    subtotal: 300,
    discount: 0,
    total: 300,
    paid: 0,
    balance: 300,

    status: "Unpaid",
  },
];