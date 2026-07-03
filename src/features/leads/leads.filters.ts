import type { Lead } from "@/types";

export type LeadStatusFilter = Lead["status"] | "all";
export type LeadSourceFilter = Lead["source"] | "all";
export type LeadFollowUpFilter = "all" | "due" | "scheduled" | "none";

export interface LeadFilters {
  query: string;
  status: LeadStatusFilter;
  source: LeadSourceFilter;
  followUp: LeadFollowUpFilter;
}

export const initialLeadFilters: LeadFilters = {
  query: "",
  status: "all",
  source: "all",
  followUp: "all",
};

export function filterLeads(
  leads: Lead[],
  filters: LeadFilters,
  isFollowUpDue: (lead: Lead) => boolean,
): Lead[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return leads.filter((lead) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      lead.fullName.toLowerCase().includes(normalizedQuery) ||
      lead.mobile.includes(normalizedQuery) ||
      lead.email?.toLowerCase().includes(normalizedQuery) === true;

    const matchesStatus =
      filters.status === "all" || lead.status === filters.status;

    const matchesSource =
      filters.source === "all" || lead.source === filters.source;

    const matchesFollowUp =
      filters.followUp === "all" ||
      (filters.followUp === "due" && isFollowUpDue(lead)) ||
      (filters.followUp === "scheduled" &&
        Boolean(lead.followUpDate) &&
        !isFollowUpDue(lead)) ||
      (filters.followUp === "none" && !lead.followUpDate);

    return (
      matchesQuery &&
      matchesStatus &&
      matchesSource &&
      matchesFollowUp
    );
  });
}