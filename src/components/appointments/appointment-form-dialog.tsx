import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAppointmentsStore,
  type CreateAppointmentInput,
} from "@/features/appointments/appointments.store";
import { useLeadsStore } from "@/features/leads/leads.store";
import {
  getMemberFullName,
} from "@/features/members/members.utils";
import { useMembersStore } from "@/features/members/members.store";
import { useTrainersStore } from "@/features/trainers/trainers.store";
import type { Appointment } from "@/types";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
}

interface AppointmentFormValues {
  title: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: Appointment["type"];
  status: Appointment["status"];
  memberId: string;
  leadId: string;
  trainerId: string;
  notes: string;
}

function getTodayDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function getInitialValues(
  appointment?: Appointment,
): AppointmentFormValues {
  if (appointment) {
    return {
      title: appointment.title,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      status: appointment.status,
      memberId: appointment.memberId ?? "",
      leadId: appointment.leadId ?? "",
      trainerId: appointment.trainerId ?? "",
      notes: appointment.notes ?? "",
    };
  }

  return {
    title: "",
    appointmentDate: getTodayDate(),
    startTime: "18:00",
    endTime: "18:30",
    type: "general",
    status: "scheduled",
    memberId: "",
    leadId: "",
    trainerId: "",
    notes: "",
  };
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
}: AppointmentFormDialogProps) {
  const members = useMembersStore((state) => state.members);
  const leads = useLeadsStore((state) => state.leads);
  const trainers = useTrainersStore((state) => state.trainers);
  const addAppointment = useAppointmentsStore(
    (state) => state.addAppointment,
  );
  const updateAppointment = useAppointmentsStore(
    (state) => state.updateAppointment,
  );

  const [values, setValues] = useState<AppointmentFormValues>(() =>
    getInitialValues(appointment),
  );
  const [error, setError] = useState<string | null>(null);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((firstMember, secondMember) =>
        getMemberFullName(firstMember).localeCompare(
          getMemberFullName(secondMember),
        ),
      ),
    [members],
  );

  const sortedLeads = useMemo(
    () =>
      [...leads]
        .filter((lead) => lead.status !== "converted")
        .sort((firstLead, secondLead) =>
          firstLead.fullName.localeCompare(secondLead.fullName),
        ),
    [leads],
  );

  const sortedTrainers = useMemo(
    () =>
      [...trainers]
        .filter((trainer) => trainer.isActive)
        .sort((firstTrainer, secondTrainer) =>
          firstTrainer.fullName.localeCompare(secondTrainer.fullName),
        ),
    [trainers],
  );

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(appointment));
      setError(null);
    }
  }, [appointment, open]);

  function updateValue<Key extends keyof AppointmentFormValues>(
    key: Key,
    value: AppointmentFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleMemberChange(memberId: string) {
    setValues((current) => ({
      ...current,
      memberId,
      leadId: memberId ? "" : current.leadId,
    }));
  }

  function handleLeadChange(leadId: string) {
    setValues((current) => ({
      ...current,
      leadId,
      memberId: leadId ? "" : current.memberId,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setError("Enter an appointment title.");
      return;
    }

    if (!values.appointmentDate) {
      setError("Select an appointment date.");
      return;
    }

    if (!values.startTime || !values.endTime) {
      setError("Select a start and end time.");
      return;
    }

    if (values.endTime <= values.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    const input: CreateAppointmentInput = {
      title: values.title,
      appointmentDate: values.appointmentDate,
      startTime: values.startTime,
      endTime: values.endTime,
      type: values.type,
      status: values.status,
      memberId: values.memberId || undefined,
      leadId: values.leadId || undefined,
      trainerId: values.trainerId || undefined,
      notes: values.notes || undefined,
    };

    if (appointment) {
      updateAppointment(appointment.id, input);
      toast.success("Appointment updated.");
    } else {
      addAppointment(input);
      toast.success("Appointment scheduled.");
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit appointment" : "Schedule appointment"}
          </DialogTitle>
          <DialogDescription>
            Add a trainer consultation, trial session, renewal discussion, or
            general front-desk appointment.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="appointment-title">
              <Input
                id="appointment-title"
                value={values.title}
                onChange={(event) => updateValue("title", event.target.value)}
                placeholder="For example: Trial session with Aman"
              />
            </Field>

            <Field label="Appointment type" htmlFor="appointment-type">
              <Select
                id="appointment-type"
                value={values.type}
                onChange={(event) =>
                  updateValue(
                    "type",
                    event.target.value as Appointment["type"],
                  )
                }
              >
                <option value="trial_session">Trial session</option>
                <option value="trainer_consultation">
                  Trainer consultation
                </option>
                <option value="renewal_discussion">
                  Renewal discussion
                </option>
                <option value="general">General appointment</option>
              </Select>
            </Field>

            <Field label="Date" htmlFor="appointment-date">
              <Input
                id="appointment-date"
                type="date"
                value={values.appointmentDate}
                onChange={(event) =>
                  updateValue("appointmentDate", event.target.value)
                }
              />
            </Field>

            <Field label="Status" htmlFor="appointment-status">
              <Select
                id="appointment-status"
                value={values.status}
                onChange={(event) =>
                  updateValue(
                    "status",
                    event.target.value as Appointment["status"],
                  )
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No show</option>
              </Select>
            </Field>

            <Field label="Start time" htmlFor="appointment-start-time">
              <Input
                id="appointment-start-time"
                type="time"
                value={values.startTime}
                onChange={(event) =>
                  updateValue("startTime", event.target.value)
                }
              />
            </Field>

            <Field label="End time" htmlFor="appointment-end-time">
              <Input
                id="appointment-end-time"
                type="time"
                value={values.endTime}
                onChange={(event) =>
                  updateValue("endTime", event.target.value)
                }
              />
            </Field>

            <Field label="Member (optional)" htmlFor="appointment-member">
              <Select
                id="appointment-member"
                value={values.memberId}
                onChange={(event) => handleMemberChange(event.target.value)}
              >
                <option value="">No member linked</option>
                {sortedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {getMemberFullName(member)} · {member.memberCode}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Lead (optional)" htmlFor="appointment-lead">
              <Select
                id="appointment-lead"
                value={values.leadId}
                onChange={(event) => handleLeadChange(event.target.value)}
              >
                <option value="">No lead linked</option>
                {sortedLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.fullName} · {lead.mobile}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Trainer (optional)" htmlFor="appointment-trainer">
              <Select
                id="appointment-trainer"
                value={values.trainerId}
                onChange={(event) =>
                  updateValue("trainerId", event.target.value)
                }
              >
                <option value="">No trainer assigned</option>
                {sortedTrainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.fullName}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Notes" htmlFor="appointment-notes">
            <Textarea
              id="appointment-notes"
              value={values.notes}
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Optional preparation notes or appointment context"
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {appointment ? "Save changes" : "Schedule appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}