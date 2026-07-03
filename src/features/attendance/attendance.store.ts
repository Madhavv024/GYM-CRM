import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedAttendance } from "@/data/seed";
import { createId, localStorageAdapter } from "@/lib/storage";
import type { Attendance, AttendanceSource } from "@/types";

export interface CreateAttendanceInput {
  memberId: string;
  memberCode: string;
  source: AttendanceSource;
  checkedInBy: string;
  checkedInAt?: string;
  notes?: string;
}

interface AttendanceState {
  attendance: Attendance[];
  addAttendance: (input: CreateAttendanceInput) => Attendance;
  deleteAttendance: (id: string) => void;
  resetAttendance: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      attendance: seedAttendance,

      addAttendance: (input) => {
        const attendanceRecord: Attendance = {
          id: createId("attendance"),
          memberId: input.memberId,
          memberCode: input.memberCode,
          source: input.source,
          checkedInBy: input.checkedInBy.trim() || "Front desk",
          checkedInAt: input.checkedInAt ?? new Date().toISOString(),
          notes: input.notes?.trim() || undefined,
        };

        set((state) => ({
          attendance: [attendanceRecord, ...state.attendance],
        }));

        return attendanceRecord;
      },

      deleteAttendance: (id) => {
        set((state) => ({
          attendance: state.attendance.filter((record) => record.id !== id),
        }));
      },

      resetAttendance: () => {
        set({ attendance: seedAttendance });
      },
    }),
    {
      name: "attendance",
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
    },
  ),
);