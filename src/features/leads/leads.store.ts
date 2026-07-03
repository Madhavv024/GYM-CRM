import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedLeads } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Lead, LeadStatus } from "@/types";

export interface CreateLeadInput {
  fullName: string;
  mobile: string;
  email?: string;
  interestedPlanId?: string;
  source: Lead["source"];
  status: LeadStatus;
  assignedTo?: string;
  followUpDate?: string;
  notes?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;

interface LeadsState {
  leads: Lead[];
  addLead: (input: CreateLeadInput) => Lead;
  updateLead: (id: string, updates: UpdateLeadInput) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  convertLead: (id: string, memberId: string) => void;
  deleteLead: (id: string) => void;
  resetLeads: () => void;
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set) => ({
      leads: seedLeads,

      addLead: (input) => {
        const now = new Date().toISOString();

        const lead: Lead = {
          id: createId("lead"),
          fullName: input.fullName.trim(),
          mobile: input.mobile.trim(),
          email: input.email?.trim() || undefined,
          interestedPlanId: input.interestedPlanId || undefined,
          source: input.source,
          status: input.status,
          assignedTo: input.assignedTo?.trim() || undefined,
          followUpDate: input.followUpDate || undefined,
          notes: input.notes?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          leads: [lead, ...state.leads],
        }));

        return lead;
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  ...updates,
                  fullName: updates.fullName?.trim() ?? lead.fullName,
                  mobile: updates.mobile?.trim() ?? lead.mobile,
                  email: updates.email?.trim() || undefined,
                  assignedTo: updates.assignedTo?.trim() || undefined,
                  notes: updates.notes?.trim() || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : lead,
          ),
        }));
      },

      updateLeadStatus: (id, status) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : lead,
          ),
        }));
      },

      convertLead: (id, memberId) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  status: "converted",
                  convertedMemberId: memberId,
                  followUpDate: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : lead,
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },

      resetLeads: () => {
        set({ leads: seedLeads });
      },
    }),
    {
      name: "leads",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);