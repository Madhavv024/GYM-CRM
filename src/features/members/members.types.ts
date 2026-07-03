import type { Member, MembershipHistoryEntry } from "@/types";

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  gender: Member["gender"];
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  profileImageUrl?: string;
  planId: string;
  planName: string;
  planPrice: number;
  membershipStartDate: string;
  membershipEndDate: string;
  assignedTrainerId?: string;
  notes?: string;
}

export interface UpdateMemberInput
  extends Partial<
    Omit<
      CreateMemberInput,
      | "planName"
      | "planPrice"
      | "membershipStartDate"
      | "membershipEndDate"
    >
  > {
  membershipStartDate?: string;
  membershipEndDate?: string;
  isPaused?: boolean;
  pauseReason?: string;
}

export interface RenewMembershipInput {
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  price: number;
  notes?: string;
}

export interface PauseMembershipInput {
  reason: string;
}

export interface MemberWithDerivedData extends Member {
  fullName: string;
  membershipStatus: "active" | "expiring_soon" | "expired" | "paused";
  pendingDues: number;
  totalSuccessfulPayments: number;
}

export type MembershipRenewalHistory = MembershipHistoryEntry;