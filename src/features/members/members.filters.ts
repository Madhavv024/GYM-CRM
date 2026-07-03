import type { MembershipStatus, Member } from "@/types";
import { getMemberFullName, getMembershipStatus } from "@/features/members/members.utils";

export type MemberStatusFilter = MembershipStatus | "all";

export interface MemberFilters {
  query: string;
  status: MemberStatusFilter;
  planId: string;
}

export const initialMemberFilters: MemberFilters = {
  query: "",
  status: "all",
  planId: "all",
};

export function filterMembers(
  members: Member[],
  filters: MemberFilters,
): Member[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return members.filter((member) => {
    const memberStatus = getMembershipStatus(member);

    const matchesQuery =
      normalizedQuery.length === 0 ||
      getMemberFullName(member).toLowerCase().includes(normalizedQuery) ||
      member.memberCode.toLowerCase().includes(normalizedQuery) ||
      member.mobile.includes(normalizedQuery);

    const matchesStatus =
      filters.status === "all" || memberStatus === filters.status;

    const matchesPlan =
      filters.planId === "all" || member.planId === filters.planId;

    return matchesQuery && matchesStatus && matchesPlan;
  });
}