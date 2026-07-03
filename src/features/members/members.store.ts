import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedMembers } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Member, MembershipHistoryEntry } from "@/types";
import type {
  CreateMemberInput,
  PauseMembershipInput,
  RenewMembershipInput,
  UpdateMemberInput,
} from "@/features/members/members.types";

interface MembersState {
  members: Member[];
  addMember: (input: CreateMemberInput) => Member;
  updateMember: (id: string, updates: UpdateMemberInput) => void;
  deleteMember: (id: string) => void;
  renewMembership: (memberId: string, input: RenewMembershipInput) => void;
  pauseMembership: (memberId: string, input: PauseMembershipInput) => void;
  resumeMembership: (memberId: string) => void;
  resetMembers: () => void;
}

function getNextMemberCode(members: Member[]) {
  const numericCodes = members
    .map((member) => Number(member.memberCode.replace("GF-", "")))
    .filter((code) => Number.isFinite(code));

  const highestCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 1000;

  return `GF-${highestCode + 1}`;
}

export const useMembersStore = create<MembersState>()(
  persist(
    (set, get) => ({
      members: seedMembers,

      addMember: (input) => {
        const now = new Date().toISOString();
        const memberId = createId("member");
        const memberCode = getNextMemberCode(get().members);

        const initialHistoryEntry: MembershipHistoryEntry = {
          id: createId("membership-history"),
          planId: input.planId,
          planName: input.planName,
          startDate: input.membershipStartDate,
          endDate: input.membershipEndDate,
          price: input.planPrice,
          renewedAt: now,
          notes: "Initial membership created.",
        };

        const member: Member = {
          id: memberId,
          memberCode,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          mobile: input.mobile.trim(),
          email: input.email?.trim() || undefined,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth,
          address: input.address?.trim() || undefined,
          emergencyContactName: input.emergencyContactName?.trim() || undefined,
          emergencyContactMobile: input.emergencyContactMobile?.trim() || undefined,
          profileImageUrl: input.profileImageUrl?.trim() || undefined,
          planId: input.planId,
          membershipStartDate: input.membershipStartDate,
          membershipEndDate: input.membershipEndDate,
          isPaused: false,
          joinedAt: input.membershipStartDate,
          assignedTrainerId: input.assignedTrainerId,
          notes: input.notes?.trim() || undefined,
          membershipHistory: [initialHistoryEntry],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          members: [member, ...state.members],
        }));

        return member;
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? {
                  ...member,
                  ...updates,
                  firstName: updates.firstName?.trim() ?? member.firstName,
                  lastName: updates.lastName?.trim() ?? member.lastName,
                  mobile: updates.mobile?.trim() ?? member.mobile,
                  email: updates.email?.trim() || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : member,
          ),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }));
      },

      renewMembership: (memberId, input) => {
        const historyEntry: MembershipHistoryEntry = {
          id: createId("membership-history"),
          planId: input.planId,
          planName: input.planName,
          startDate: input.startDate,
          endDate: input.endDate,
          price: input.price,
          renewedAt: new Date().toISOString(),
          notes: input.notes,
        };

        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  planId: input.planId,
                  membershipStartDate: input.startDate,
                  membershipEndDate: input.endDate,
                  isPaused: false,
                  pauseReason: undefined,
                  membershipHistory: [...member.membershipHistory, historyEntry],
                  updatedAt: new Date().toISOString(),
                }
              : member,
          ),
        }));
      },

      pauseMembership: (memberId, input) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  isPaused: true,
                  pauseReason: input.reason.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : member,
          ),
        }));
      },

      resumeMembership: (memberId) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  isPaused: false,
                  pauseReason: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : member,
          ),
        }));
      },

      resetMembers: () => {
        set({ members: seedMembers });
      },
    }),
    {
      name: "members",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);