import {
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import type { Attendance } from "@/types";

export function formatAttendanceDateTime(dateTime: string) {
  return format(parseISO(dateTime), "dd MMM yyyy, hh:mm a");
}

export function formatAttendanceTime(dateTime: string) {
  return format(parseISO(dateTime), "hh:mm a");
}

export function getTodayAttendance(attendance: Attendance[]) {
  const today = new Date();

  return attendance.filter((record) =>
    isSameDay(parseISO(record.checkedInAt), today),
  );
}

export function getAttendanceForMember(
  attendance: Attendance[],
  memberId: string,
) {
  return attendance
    .filter((record) => record.memberId === memberId)
    .sort(
      (firstRecord, secondRecord) =>
        parseISO(secondRecord.checkedInAt).getTime() -
        parseISO(firstRecord.checkedInAt).getTime(),
    );
}

export function hasMemberCheckedInOnDate(
  attendance: Attendance[],
  memberId: string,
  date: Date = new Date(),
) {
  return attendance.some(
    (record) =>
      record.memberId === memberId &&
      isSameDay(parseISO(record.checkedInAt), date),
  );
}

export function getAttendanceCountForDate(
  attendance: Attendance[],
  date: Date,
) {
  return attendance.filter((record) =>
    isSameDay(parseISO(record.checkedInAt), date),
  ).length;
}

export function getAttendanceDates(
  attendance: Attendance[],
) {
  return Array.from(
    new Set(
      attendance.map((record) =>
        format(startOfDay(parseISO(record.checkedInAt)), "yyyy-MM-dd"),
      ),
    ),
  );
}