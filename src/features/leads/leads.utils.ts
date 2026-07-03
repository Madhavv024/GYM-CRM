import { format, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import type { Lead } from "@/types";

export function formatLeadDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy");
}

export function getLeadStatusLabel(status: Lead["status"]) {
  return LEAD_STATUS_LABELS[status];
}

export function getLeadSourceLabel(source: Lead["source"]) {
  return LEAD_SOURCE_LABELS[source];
}

export function isLeadFollowUpDue(lead: Lead, date: Date = new Date()) {
  if (!lead.followUpDate || lead.status === "converted" || lead.status === "lost") {
    return false;
  }

  const followUpDate = startOfDay(parseISO(lead.followUpDate));
  const comparisonDate = startOfDay(date);

  return isBefore(followUpDate, comparisonDate) || isSameDay(followUpDate, comparisonDate);
}

export function getDueFollowUps(leads: Lead[], date: Date = new Date()) {
  return leads.filter((lead) => isLeadFollowUpDue(lead, date));
}

export function canConvertLead(lead: Lead) {
  return lead.status !== "converted" && lead.status !== "lost";
}