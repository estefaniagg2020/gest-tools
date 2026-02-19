export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type AppointmentPaymentStatus = "pending" | "paid";

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName?: string;
  serviceId?: string;
  memberId?: string;
  start: string;
  end: string;
  notes?: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
  isAtHome?: boolean;
  paymentStatus?: AppointmentPaymentStatus;
  isVIP?: boolean;
  cartItems?: CartItem[];
}
