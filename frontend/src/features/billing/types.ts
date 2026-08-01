export type BillStatus =
  | "Paid"
  | "Partially Paid"
  | "Unpaid";

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

export interface Bill {
  id: number;
  billNumber: string;

  patientId: number;
  patientName: string;
  uhid: string;

  date: string;

  items: BillItem[];

  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;

  status: BillStatus;
}