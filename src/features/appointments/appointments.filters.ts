import { isSameDay, parseISO, startOfDay } from "date-fns";
import type { Appointment } from "@/types";

export interface AppointmentFilters {
  query: string;
  date: "all" | "today" | "upcoming" | "past";
  status: Appointment["status"] | "all";
  type: Appointment["type"] | "all";
}

export const initialAppointmentFilters: AppointmentFilters = {
  query: "",
  date: "all",
  status: "all",
  type: "all",
};

export function filterAppointments(
  appointments: Appointment[],
  filters: AppointmentFilters,
  referenceDate = new Date(),
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const today = startOfDay(referenceDate);

  return appointments.filter((appointment) => {
    const appointmentDate = startOfDay(parseISO(appointment.appointmentDate));

    const matchesQuery =
      normalizedQuery.length === 0 ||
      appointment.title.toLowerCase().includes(normalizedQuery) ||
      appointment.notes?.toLowerCase().includes(normalizedQuery) === true;

    const matchesStatus =
      filters.status === "all" || appointment.status === filters.status;

    const matchesType =
      filters.type === "all" || appointment.type === filters.type;

    const matchesDate =
      filters.date === "all" ||
      (filters.date === "today" &&
        isSameDay(appointmentDate, referenceDate)) ||
      (filters.date === "upcoming" && appointmentDate > today) ||
      (filters.date === "past" && appointmentDate < today);

    return matchesQuery && matchesStatus && matchesType && matchesDate;
  });
}