import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { Appointment } from "@/types";

export function formatAppointmentDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy");
}

export function formatAppointmentTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return format(date, "h:mm a");
}

export function formatAppointmentTimeRange(
  startTime: string,
  endTime: string,
) {
  return `${formatAppointmentTime(startTime)} – ${formatAppointmentTime(endTime)}`;
}

export function getAppointmentStatusLabel(status: Appointment["status"]) {
  return APPOINTMENT_STATUS_LABELS[status];
}

export function getAppointmentTypeLabel(type: Appointment["type"]) {
  return APPOINTMENT_TYPE_LABELS[type];
}

export function getAppointmentDateTime(appointment: Appointment) {
  return parseISO(`${appointment.appointmentDate}T${appointment.startTime}`);
}

export function sortAppointmentsByDateTime(appointments: Appointment[]) {
  return [...appointments].sort(
    (firstAppointment, secondAppointment) =>
      getAppointmentDateTime(firstAppointment).getTime() -
      getAppointmentDateTime(secondAppointment).getTime(),
  );
}

export function getTodayAppointments(
  appointments: Appointment[],
  referenceDate = new Date(),
) {
  return sortAppointmentsByDateTime(
    appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.appointmentDate), referenceDate),
    ),
  );
}

export function getUpcomingAppointments(
  appointments: Appointment[],
  referenceDate = new Date(),
) {
  const today = startOfDay(referenceDate);

  return sortAppointmentsByDateTime(
    appointments.filter((appointment) => {
      const appointmentDate = startOfDay(
        parseISO(appointment.appointmentDate),
      );

      return (
        isAfter(appointmentDate, today) &&
        appointment.status === "scheduled"
      );
    }),
  );
}

export function getOverdueAppointments(
  appointments: Appointment[],
  referenceDate = new Date(),
) {
  const now = referenceDate;

  return sortAppointmentsByDateTime(
    appointments.filter((appointment) => {
      if (appointment.status !== "scheduled") {
        return false;
      }

      return isBefore(getAppointmentDateTime(appointment), now);
    }),
  );
}