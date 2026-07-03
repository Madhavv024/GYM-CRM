export type MembershipStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "paused";

export type PaymentStatus = "successful" | "partial" | "failed" | "refunded";

export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer";

export type AttendanceSource = "manual" | "member_lookup" | "future_biometric";

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "trial_booked"
  | "converted"
  | "lost";

export type LeadSource =
  | "walk_in"
  | "instagram"
  | "google"
  | "referral"
  | "phone"
  | "website";

export type ExpenseCategory =
| "rent"
| "electricity"
| "salary"
| "equipment"
| "maintenance"
| "utilities"
| "marketing"
| "supplies"
| "other";

export interface MembershipPlan {
  id: string;
  name: string;
  durationInDays: number;
  price: number;
  joiningFee: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface MembershipHistoryEntry {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  price: number;
  renewedAt: string;
  notes?: string;
}

export interface Member {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  profileImageUrl?: string;
  planId: string;
  membershipStartDate: string;
  membershipEndDate: string;
  isPaused: boolean;
  pauseReason?: string;
  joinedAt: string;
  assignedTrainerId?: string;
  notes?: string;
  membershipHistory: MembershipHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberCode: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptNumber: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberCode: string;
  checkedInAt: string;
  source: AttendanceSource;
  checkedInBy: string;
  notes?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  interestedPlanId?: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  convertedMemberId?: string;
}

export interface Trainer {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  specialization: string[];
  joiningDate: string;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  title: string;
  trainerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledMemberIds: string[];
  isActive: boolean;
}

export interface GymSettings {
  gymName: string;
  gymPhone: string;
  gymEmail: string;
  gymAddress: string;
  currency: "INR";
  attendanceBlockingEnabled: boolean;
  renewalAlertDays: number;
}