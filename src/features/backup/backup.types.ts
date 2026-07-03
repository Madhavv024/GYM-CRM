import type {
  Appointment,
  Expense,
  Lead,
  Member,
  MembershipPlan,
  Payment,
  Trainer,
} from "@/types";

export const BACKUP_VERSION = 1;

export interface CrmBackupData {
  members: Member[];
  plans: MembershipPlan[];
  payments: Payment[];
  leads: Lead[];
  expenses: Expense[];
  appointments: Appointment[];
  trainers: Trainer[];
}

export interface CrmBackup {
  version: typeof BACKUP_VERSION;
  app: "SK-Fitness CRM";
  exportedAt: string;
  data: CrmBackupData;
}

export interface BackupSummary {
  members: number;
  plans: number;
  payments: number;
  leads: number;
  expenses: number;
  appointments: number;
  trainers: number;
}