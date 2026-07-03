import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedAppointments } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/types";

export interface CreateAppointmentInput {
  title: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  memberId?: string;
  leadId?: string;
  trainerId?: string;
  notes?: string;
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

interface AppointmentsState {
  appointments: Appointment[];
  addAppointment: (input: CreateAppointmentInput) => Appointment;
  updateAppointment: (id: string, updates: UpdateAppointmentInput) => void;
  deleteAppointment: (id: string) => void;
  resetAppointments: () => void;
}

function normalizeOptionalText(value: string | undefined) {
  return value?.trim() || undefined;
}

export const useAppointmentsStore = create<AppointmentsState>()(
  persist(
    (set) => ({
      appointments: seedAppointments,

      addAppointment: (input) => {
        const now = new Date().toISOString();

        const appointment: Appointment = {
          id: createId("appointment"),
          title: input.title.trim(),
          appointmentDate: input.appointmentDate,
          startTime: input.startTime,
          endTime: input.endTime,
          type: input.type,
          status: input.status,
          memberId: input.memberId || undefined,
          leadId: input.leadId || undefined,
          trainerId: input.trainerId || undefined,
          notes: normalizeOptionalText(input.notes),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          appointments: [appointment, ...state.appointments],
        }));

        return appointment;
      },

      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id
              ? {
                  ...appointment,
                  ...updates,
                  title:
                    updates.title === undefined
                      ? appointment.title
                      : updates.title.trim(),
                  memberId:
                    updates.memberId === undefined
                      ? appointment.memberId
                      : updates.memberId || undefined,
                  leadId:
                    updates.leadId === undefined
                      ? appointment.leadId
                      : updates.leadId || undefined,
                  trainerId:
                    updates.trainerId === undefined
                      ? appointment.trainerId
                      : updates.trainerId || undefined,
                  notes:
                    updates.notes === undefined
                      ? appointment.notes
                      : normalizeOptionalText(updates.notes),
                  updatedAt: new Date().toISOString(),
                }
              : appointment,
          ),
        }));
      },

      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter(
            (appointment) => appointment.id !== id,
          ),
        }));
      },

      resetAppointments: () => {
        set({ appointments: seedAppointments });
      },
    }),
    {
      name: "appointments",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);