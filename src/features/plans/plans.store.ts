import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedPlans } from "@/data/seed";
import { localStorageAdapter } from "@/lib/storage";
import type { MembershipPlan } from "@/types";

export type CreatePlanInput = Omit<MembershipPlan, "id" | "createdAt">;

export type UpdatePlanInput = Partial<Omit<MembershipPlan, "id" | "createdAt">>;

interface PlansState {
  plans: MembershipPlan[];
  addPlan: (plan: CreatePlanInput) => void;
  updatePlan: (id: string, updates: UpdatePlanInput) => void;
  togglePlanStatus: (id: string) => void;
  deletePlan: (id: string) => void;
  resetPlans: () => void;
}

function createPlanId() {
  return `plan-${crypto.randomUUID()}`;
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: seedPlans,

      addPlan: (plan) => {
        const createdPlan: MembershipPlan = {
          ...plan,
          id: createPlanId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          plans: [createdPlan, ...state.plans],
        }));
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan,
          ),
        }));
      },

      togglePlanStatus: (id) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, isActive: !plan.isActive } : plan,
          ),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== id),
        }));
      },

      resetPlans: () => {
        set({ plans: seedPlans });
      },
    }),
    {
      name: "plans",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);