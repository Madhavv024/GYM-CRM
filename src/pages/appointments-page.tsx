import { useMemo, useState } from "react";
import {
//   CalendarClock,
  Edit3,
  Funnel,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  filterAppointments,
  initialAppointmentFilters,
  type AppointmentFilters,
} from "@/features/appointments/appointments.filters";
import { useAppointmentsStore } from "@/features/appointments/appointments.store";
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getAppointmentStatusLabel,
  getAppointmentTypeLabel,
  getTodayAppointments,
  getUpcomingAppointments,
  sortAppointmentsByDateTime,
} from "@/features/appointments/appointments.utils";
import { useLeadsStore } from "@/features/leads/leads.store";
import { getMemberFullName } from "@/features/members/members.utils";
import { useMembersStore } from "@/features/members/members.store";
import { useTrainersStore } from "@/features/trainers/trainers.store";
import type { Appointment } from "@/types";

export function AppointmentsPage() {
  const appointments = useAppointmentsStore((state) => state.appointments);
  const deleteAppointment = useAppointmentsStore(
    (state) => state.deleteAppointment,
  );
  const members = useMembersStore((state) => state.members);
  const leads = useLeadsStore((state) => state.leads);
  const trainers = useTrainersStore((state) => state.trainers);

  const [filters, setFilters] = useState<AppointmentFilters>(
    initialAppointmentFilters,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<
    Appointment | undefined
  >();
  const [appointmentToDelete, setAppointmentToDelete] = useState<
    Appointment | undefined
  >();

  const filteredAppointments = useMemo(
    () =>
      sortAppointmentsByDateTime(
        filterAppointments(appointments, filters),
      ),
    [appointments, filters],
  );

  const summary = useMemo(
    () => ({
      today: getTodayAppointments(appointments).length,
      upcoming: getUpcomingAppointments(appointments).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "completed",
      ).length,
      total: appointments.length,
    }),
    [appointments],
  );

  const activeFilterCount = [
    filters.query.trim().length > 0,
    filters.date !== "all",
    filters.status !== "all",
    filters.type !== "all",
  ].filter(Boolean).length;

  function updateFilters(updates: Partial<AppointmentFilters>) {
    setFilters((current) => ({ ...current, ...updates }));
  }

  function handleCreateAppointment() {
    setAppointmentToEdit(undefined);
    setIsFormOpen(true);
  }

  function handleEditAppointment(appointment: Appointment) {
    setAppointmentToEdit(appointment);
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      setAppointmentToEdit(undefined);
    }
  }

  function handleDeleteAppointment() {
    if (!appointmentToDelete) {
      return;
    }

    const title = appointmentToDelete.title;
    deleteAppointment(appointmentToDelete.id);
    toast.success(`${title} was deleted.`);
    setAppointmentToDelete(undefined);
  }

  function clearFilters() {
    setFilters(initialAppointmentFilters);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Front desk schedule
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Appointments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Schedule trials, trainer consultations, renewal discussions, and
            other front-desk appointments.
          </p>
        </div>

        <Button onClick={handleCreateAppointment}>
          <Plus className="size-4" />
          Schedule appointment
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Today"
          value={String(summary.today)}
          description="Appointments on today’s schedule"
        />
        <SummaryCard
          label="Upcoming"
          value={String(summary.upcoming)}
          description="Scheduled after today"
        />
        <SummaryCard
          label="Completed"
          value={String(summary.completed)}
          description="Completed appointment records"
        />
        <SummaryCard
          label="Total"
          value={String(summary.total)}
          description="All local appointment records"
        />
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Appointment schedule
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredAppointments.length} of {appointments.length}{" "}
              appointments shown
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear filters ({activeFilterCount})
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_150px_160px_180px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
              className="pl-9"
              placeholder="Search title or notes"
              aria-label="Search appointments"
            />
          </div>

          <Select
            value={filters.date}
            onChange={(event) =>
              updateFilters({
                date: event.target.value as AppointmentFilters["date"],
              })
            }
            aria-label="Filter by date"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </Select>

          <Select
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as AppointmentFilters["status"],
              })
            }
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No show</option>
          </Select>

          <Select
            value={filters.type}
            onChange={(event) =>
              updateFilters({
                type: event.target.value as AppointmentFilters["type"],
              })
            }
            aria-label="Filter by appointment type"
          >
            <option value="all">All types</option>
            <option value="trial_session">Trial session</option>
            <option value="trainer_consultation">
              Trainer consultation
            </option>
            <option value="renewal_discussion">Renewal discussion</option>
            <option value="general">General appointment</option>
          </Select>
        </div>

        {filteredAppointments.length === 0 ? (
          <EmptyState
            className="m-4"
            icon={<Funnel className="size-5" />}
            title={
              appointments.length === 0
                ? "No appointments scheduled"
                : "No appointments found"
            }
            description={
              appointments.length === 0
                ? "Schedule the first trial, consultation, or renewal discussion."
                : "Try changing the search term or clearing the active filters."
            }
            action={
              appointments.length === 0 ? (
                <Button onClick={handleCreateAppointment}>
                  <Plus className="size-4" />
                  Schedule appointment
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1080px] text-left">
                <thead className="bg-muted/30 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Appointment</th>
                    <th className="px-5 py-3">Date & time</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Trainer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentTableRow
                      key={appointment.id}
                      appointment={appointment}
                      contactName={getContactName(appointment, members, leads)}
                      trainerName={getTrainerName(appointment, trainers)}
                      onEdit={handleEditAppointment}
                      onDelete={setAppointmentToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredAppointments.map((appointment) => (
                <AppointmentMobileCard
                  key={appointment.id}
                  appointment={appointment}
                  contactName={getContactName(appointment, members, leads)}
                  trainerName={getTrainerName(appointment, trainers)}
                  onEdit={handleEditAppointment}
                  onDelete={setAppointmentToDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <AppointmentFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        appointment={appointmentToEdit}
      />

      <DeleteAppointmentDialog
        appointment={appointmentToDelete}
        onConfirm={handleDeleteAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setAppointmentToDelete(undefined);
          }
        }}
      />
    </div>
  );
}

function AppointmentTableRow({
  appointment,
  contactName,
  trainerName,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  contactName: string;
  trainerName: string;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <p className="font-bold text-foreground">{appointment.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {getAppointmentTypeLabel(appointment.type)}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-foreground">
          {formatAppointmentDate(appointment.appointmentDate)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatAppointmentTimeRange(
            appointment.startTime,
            appointment.endTime,
          )}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">
        {contactName}
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">
        {trainerName}
      </td>
      <td className="px-5 py-4">
        <AppointmentStatusBadge status={appointment.status} />
      </td>
      <td className="px-5 py-4">
        <AppointmentActions
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function AppointmentMobileCard({
  appointment,
  contactName,
  trainerName,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  contactName: string;
  trainerName: string;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{appointment.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {getAppointmentTypeLabel(appointment.type)}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Date & time
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatAppointmentDate(appointment.appointmentDate)}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            {formatAppointmentTimeRange(
              appointment.startTime,
              appointment.endTime,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Contact
          </dt>
          <dd className="mt-1 font-medium text-foreground">{contactName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Trainer
          </dt>
          <dd className="mt-1 font-medium text-foreground">{trainerName}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-3">
        <AppointmentActions
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function AppointmentActions({
  appointment,
  onEdit,
  onDelete,
}: {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(appointment)}
        aria-label={`Edit ${appointment.title}`}
        title="Edit appointment"
      >
        <Edit3 className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => onDelete(appointment)}
        aria-label={`Delete ${appointment.title}`}
        title="Delete appointment"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function AppointmentStatusBadge({
  status,
}: {
  status: Appointment["status"];
}) {
  const variantByStatus: Record<
    Appointment["status"],
    "default" | "success" | "warning" | "danger" | "info" | "muted"
  > = {
    scheduled: "info",
    completed: "success",
    cancelled: "muted",
    no_show: "danger",
  };

  return (
    <Badge variant={variantByStatus[status]}>
      {getAppointmentStatusLabel(status)}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="glass-surface rounded-lg border border-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </article>
  );
}

function DeleteAppointmentDialog({
  appointment,
  onConfirm,
  onOpenChange,
}: {
  appointment: Appointment | undefined;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={Boolean(appointment)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            {appointment
              ? `This will permanently remove “${appointment.title}”. Use the appointment status instead if you need to retain a cancelled or no-show record.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="bg-danger text-white hover:bg-danger/90"
              onClick={onConfirm}
            >
              Delete appointment
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getContactName(
  appointment: Appointment,
  members: ReturnType<typeof useMembersStore.getState>["members"],
  leads: ReturnType<typeof useLeadsStore.getState>["leads"],
) {
  if (appointment.memberId) {
    const member = members.find((item) => item.id === appointment.memberId);

    return member ? getMemberFullName(member) : "Deleted member";
  }

  if (appointment.leadId) {
    return (
      leads.find((item) => item.id === appointment.leadId)?.fullName ??
      "Deleted lead"
    );
  }

  return "Not linked";
}

function getTrainerName(
  appointment: Appointment,
  trainers: ReturnType<typeof useTrainersStore.getState>["trainers"],
) {
  if (!appointment.trainerId) {
    return "Not assigned";
  }

  return (
    trainers.find((trainer) => trainer.id === appointment.trainerId)
      ?.fullName ?? "Deleted trainer"
  );
}