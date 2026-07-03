import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedTrainers } from "@/data/seed";
import { localStorageAdapter } from "@/lib/storage";
import type { Trainer } from "@/types";

export type CreateTrainerInput = Omit<Trainer, "id" | "createdAt">;

export type UpdateTrainerInput = Partial<Omit<Trainer, "id" | "createdAt">>;

interface TrainersState {
  trainers: Trainer[];
  addTrainer: (trainer: CreateTrainerInput) => void;
  updateTrainer: (id: string, updates: UpdateTrainerInput) => void;
  toggleTrainerStatus: (id: string) => void;
  deleteTrainer: (id: string) => void;
  resetTrainers: () => void;
}

function createTrainerId() {
  return `trainer-${crypto.randomUUID()}`;
}

export const useTrainersStore = create<TrainersState>()(
  persist(
    (set) => ({
      trainers: seedTrainers,

      addTrainer: (trainer) => {
        const createdTrainer: Trainer = {
          ...trainer,
          id: createTrainerId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          trainers: [createdTrainer, ...state.trainers],
        }));
      },

      updateTrainer: (id, updates) => {
        set((state) => ({
          trainers: state.trainers.map((trainer) =>
            trainer.id === id ? { ...trainer, ...updates } : trainer,
          ),
        }));
      },

      toggleTrainerStatus: (id) => {
        set((state) => ({
          trainers: state.trainers.map((trainer) =>
            trainer.id === id
              ? { ...trainer, isActive: !trainer.isActive }
              : trainer,
          ),
        }));
      },

      deleteTrainer: (id) => {
        set((state) => ({
          trainers: state.trainers.filter((trainer) => trainer.id !== id),
        }));
      },

      resetTrainers: () => {
        set({ trainers: seedTrainers });
      },
    }),
    {
      name: "trainers",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);