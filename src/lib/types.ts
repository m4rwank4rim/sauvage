export type RequestStatus =
  | "pending_quote"
  | "quoted"
  | "paid"
  | "in_progress"
  | "delivered"
  | "cancelled";

export type ProjectType =
  | "Logo & Identity"
  | "Brand Kit"
  | "Menu & Print Collateral"
  | "Social Media Pack"
  | "Signage & Billboards"
  | "Other / Custom";

export type ProjectUrgency = "standard" | "priority" | "rush";

export interface Attachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // base64 preview for client-uploaded references
}

export interface DesignRequest {
  id: string;
  clientName: string;
  discordTag: string;
  businessName?: string;
  projectType: ProjectType;
  budgetRange: string;
  urgency: ProjectUrgency;
  brief: string;
  attachments?: Attachment[];
  status: RequestStatus;
  quoteAmount?: number; // In GTAW in-game dollars ($)
  quoteNotes?: string;
  fleecaPaymentId?: string;
  fleecaPaymentLink?: string;
  userId?: string;
  deliverablesUrl?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = "pending" | "payment_successful" | "payment_failed";

export interface PaymentRecord {
  paymentId: string;
  requestId: string;
  amount: number;
  mode: 0 | 1; // 0 = sandbox, 1 = live
  description: string;
  status: PaymentStatus;
  payerRouting?: string;
  payerName?: string;
  createdAt: string;
  paidAt?: string;
}

export interface FleecaWebhookPayload {
  payment_id: string;
  payment_url: string;
  mode: "sandbox" | "live" | number;
  amount: number;
  payer_routing?: string;
  payer_name?: string;
  status: PaymentStatus;
  description?: string;
  created_at?: string;
  paid_at?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: "Logos" | "Print" | "Digital/Social" | "Signage" | "Other";
  clientName: string;
  businessType: string;
  year: string;
  description: string;
  tags: string[];
  featured: boolean;
  colorAccent: string;
  aspectRatio?: string;
  previewType: "logo" | "menu" | "digital" | "signage";
}
