import { Badge } from "@/components/ui/badge";
import type { MembershipStatus } from "@/types";

interface MembershipStatusBadgeProps {
  status: MembershipStatus;
}

const statusConfig: Record<
  MembershipStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" }
> = {
  active: { label: "Active", variant: "success" },
  expiring_soon: { label: "Expiring Soon", variant: "warning" },
  expired: { label: "Expired", variant: "danger" },
  paused: { label: "Paused", variant: "info" },
};

export function MembershipStatusBadge({
  status,
}: MembershipStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}