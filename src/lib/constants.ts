import type {
  AppointmentStatus,
  AppointmentType,
  ExpenseCategory,
  LeadSource,
  LeadStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

export const APP_NAME = "SK-Fitness CRM";

export const CURRENCY_LOCALE = "en-IN";

export const CURRENCY_CODE = "INR";

export const MEMBERSHIP_EXPIRING_SOON_DAYS = 7;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  successful: "Successful",
  partial: "Partial",
  failed: "Failed",
  refunded: "Refunded",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  trial_booked: "Trial Booked",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  walk_in: "Walk-in",
  instagram: "Instagram",
  google: "Google",
  referral: "Referral",
  phone: "Phone Call",
  website: "Website",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: "Rent",
  electricity: "Electricity",
  supplies: "Supplies",
  utilities: "Utilities",
  equipment: "Equipment",
  salary: "Salary",
  marketing: "Marketing",
  maintenance: "Maintenance",
  other: "Other",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  trial_session: "Trial session",
  trainer_consultation: "Trainer consultation",
  renewal_discussion: "Renewal discussion",
  general: "General appointment",
};