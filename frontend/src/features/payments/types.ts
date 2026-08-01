export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "Card"
  | "Bank Transfer";

export interface Payment {
  id: number;
  receiptNumber: string;

  billId: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  uhid: string;

  date: string;
  amount: number;

  method: PaymentMethod;

  reference: string;
  notes: string;
}