import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  UsersRound,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MemberFormDialog } from "@/features/members/member-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MembershipStatusBadge } from "@/components/shared/status-badge";
import {
  filterMembers,
  initialMemberFilters,
  type MemberFilters,
} from "@/features/members/members.filters";
import { useMembersStore } from "@/features/members/members.store";
import {
  formatMemberDate,
  getMemberFullName,
  getMemberInitials,
  getMembershipStatus,
} from "@/features/members/members.utils";
import { usePlansStore } from "@/features/plans/plans.store";
import { cn } from "@/lib/utils";
import type { Member } from "@/types";

export function MembersPage() {
  const members = useMembersStore((state) => state.members);
  const deleteMember = useMembersStore((state) => state.deleteMember);
  const plans = usePlansStore((state) => state.plans);

  const [filters, setFilters] = useState<MemberFilters>(initialMemberFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | undefined>();
  const [memberToDelete, setMemberToDelete] = useState<Member | undefined>();

  const filteredMembers = useMemo(
    () => filterMembers(members, filters),
    [filters, members],
  );

  const activeFilterCount = [
    filters.query.trim().length > 0,
    filters.status !== "all",
    filters.planId !== "all",
  ].filter(Boolean).length;

  function updateFilters(updates: Partial<MemberFilters>) {
    setFilters((current) => ({ ...current, ...updates }));
  }

  function handleCreateMember() {
    setMemberToEdit(undefined);
    setIsFormOpen(true);
  }

  function handleEditMember(member: Member) {
    setMemberToEdit(member);
    setIsFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      setMemberToEdit(undefined);
    }
  }

  function handleDeleteMember() {
    if (!memberToDelete) {
      return;
    }

    deleteMember(memberToDelete.id);
    toast.success(`${getMemberFullName(memberToDelete)} was removed.`);
    setMemberToDelete(undefined);
  }

  function clearFilters() {
    setFilters(initialMemberFilters);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Member management
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Members
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage member profiles, memberships, renewals, and fitness records.
          </p>
        </div>

        <Button onClick={handleCreateMember}>
          <Plus className="size-4" />
          Add member
        </Button>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Member directory
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredMembers.length} of {members.length} members shown
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear filters ({activeFilterCount})
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_200px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
              className="pl-9"
              placeholder="Search name, mobile, or member code"
              aria-label="Search members"
            />
          </div>

          <Select
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as MemberFilters["status"],
              })
            }
            aria-label="Filter by membership status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring soon</option>
            <option value="expired">Expired</option>
            <option value="paused">Paused</option>
          </Select>

          <Select
            value={filters.planId}
            onChange={(event) => updateFilters({ planId: event.target.value })}
            aria-label="Filter by membership plan"
          >
            <option value="all">All plans</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </Select>
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState
            className="m-4"
            icon={<UsersRound className="size-5" />}
            title={members.length === 0 ? "No members yet" : "No members found"}
            description={
              members.length === 0
                ? "Create your first member profile to begin managing memberships."
                : "Try changing the search term or clearing the active filters."
            }
            action={
              members.length === 0 ? (
                <Button onClick={handleCreateMember}>
                  <Plus className="size-4" />
                  Add first member
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
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-muted/30 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Membership ends</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.map((member) => (
                    <MemberTableRow
                      key={member.id}
                      member={member}
                      onEdit={handleEditMember}
                      onDelete={setMemberToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredMembers.map((member) => (
                <MemberMobileCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={setMemberToDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <MemberFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        member={memberToEdit}
      />

      <DeleteMemberDialog
        member={memberToDelete}
        onConfirm={handleDeleteMember}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToDelete(undefined);
          }
        }}
      />
    </div>
  );
}

function MemberTableRow({
  member,
  onEdit,
  onDelete,
}: {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}) {
  const status = getMembershipStatus(member);

  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <Link
          to={`/members/${member.id}`}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <MemberAvatar member={member} />
          <div>
            <p className="font-bold text-foreground transition-colors group-hover:text-primary">
              {getMemberFullName(member)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {member.memberCode}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-foreground">{member.mobile}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {member.email ?? "No email added"}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-foreground">
          {getCurrentPlanName(member)}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">
        {formatMemberDate(member.membershipEndDate)}
      </td>
      <td className="px-5 py-4">
        <MembershipStatusBadge status={status} />
      </td>
      <td className="px-5 py-4">
        <MemberActions member={member} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function MemberMobileCard({
  member,
  onEdit,
  onDelete,
}: {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}) {
  const status = getMembershipStatus(member);

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/members/${member.id}`}
          className="group flex min-w-0 items-center gap-3 focus:outline-none"
        >
          <MemberAvatar member={member} />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground transition-colors group-hover:text-primary">
              {getMemberFullName(member)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {member.memberCode}
            </p>
          </div>
        </Link>
        <MembershipStatusBadge status={status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Mobile
          </dt>
          <dd className="mt-1 font-medium text-foreground">{member.mobile}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Plan
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {getCurrentPlanName(member)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Ends
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatMemberDate(member.membershipEndDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-3">
        <MemberActions member={member} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}

function MemberActions({
  member,
  onEdit,
  onDelete,
}: {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(member)}
        aria-label={`Edit ${getMemberFullName(member)}`}
        title="Edit member"
      >
        <Edit3 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => onDelete(member)}
        aria-label={`Delete ${getMemberFullName(member)}`}
        title="Delete member"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function MemberAvatar({ member }: { member: Member }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/20",
        "bg-primary/10 text-xs font-black text-primary",
      )}
      aria-hidden="true"
    >
      {getMemberInitials(member)}
    </div>
  );
}

function DeleteMemberDialog({
  member,
  onConfirm,
  onOpenChange,
}: {
  member: Member | undefined;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog
      open={Boolean(member)}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete member profile?</AlertDialogTitle>
          <AlertDialogDescription>
            {member
              ? `This will permanently remove ${getMemberFullName(member)} from SK-Fitness CRM. This action cannot be undone.`
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
              Delete member
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getCurrentPlanName(member: Member) {
  const latestMembership = member.membershipHistory.at(-1);

  return latestMembership?.planName ?? "No plan assigned";
}