import { localStorageAdapter } from "@/lib/storage";
import {
  BACKUP_VERSION,
  type BackupSummary,
  type CrmBackup,
  type CrmBackupData,
} from "@/features/backup/backup.types";

const BACKUP_STORE_NAMES = [
  "members",
  "plans",
  "payments",
  "leads",
  "expenses",
  "appointments",
  "trainers",
] as const;

type BackupStoreName = (typeof BACKUP_STORE_NAMES)[number];

const BACKUP_STORE_STATE_KEYS: Record<BackupStoreName, keyof CrmBackupData> = {
  members: "members",
  plans: "plans",
  payments: "payments",
  leads: "leads",
  expenses: "expenses",
  appointments: "appointments",
  trainers: "trainers",
};

interface PersistedStorePayload {
  state?: Record<string, unknown>;
  version?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getStoreData<T>(
  storeName: BackupStoreName,
  stateKey: string,
): Promise<T[]> {
  const rawValue = await localStorageAdapter.getItem(storeName);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isRecord(parsedValue)) {
      return [];
    }

    const payload = parsedValue as PersistedStorePayload;
    const value = payload.state?.[stateKey];

    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

export async function createCrmBackup(): Promise<CrmBackup> {
  return {
    version: BACKUP_VERSION,
    app: "SK-Fitness CRM",
    exportedAt: new Date().toISOString(),
    data: {
      members: await getStoreData("members", "members"),
      plans: await getStoreData("plans", "plans"),
      payments: await getStoreData("payments", "payments"),
      leads: await getStoreData("leads", "leads"),
      expenses: await getStoreData("expenses", "expenses"),
      appointments: await getStoreData("appointments", "appointments"),
      trainers: await getStoreData("trainers", "trainers"),
    },
  };
}

export function getBackupSummary(data: CrmBackupData): BackupSummary {
  return {
    members: data.members.length,
    plans: data.plans.length,
    payments: data.payments.length,
    leads: data.leads.length,
    expenses: data.expenses.length,
    appointments: data.appointments.length,
    trainers: data.trainers.length,
  };
}

export async function downloadCrmBackup() {
  const backup = await createCrmBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sk-fitness-crm-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function validateCrmBackup(value: unknown):
  | { valid: true; backup: CrmBackup }
  | { valid: false; error: string } {
  if (!isRecord(value)) {
    return { valid: false, error: "The backup file must contain a JSON object." };
  }

  if (value.version !== BACKUP_VERSION) {
    return {
      valid: false,
      error: `Unsupported backup version. Expected version ${BACKUP_VERSION}.`,
    };
  }

  if (value.app !== "SK-Fitness CRM") {
    return {
      valid: false,
      error: "This file is not an SK-Fitness CRM backup.",
    };
  }

  if (typeof value.exportedAt !== "string") {
    return {
      valid: false,
      error: "The backup export date is missing or invalid.",
    };
  }

  if (!isRecord(value.data)) {
    return { valid: false, error: "The backup data section is missing." };
  }

  for (const storeName of BACKUP_STORE_NAMES) {
    const stateKey = BACKUP_STORE_STATE_KEYS[storeName];

    if (!Array.isArray(value.data[stateKey])) {
      return {
        valid: false,
        error: `The ${stateKey} collection is missing or invalid.`,
      };
    }
  }

  return {
    valid: true,
    backup: value as unknown as CrmBackup,
  };
}

export async function parseCrmBackupFile(file: File) {
  try {
    const content = await file.text();
    const parsedValue: unknown = JSON.parse(content);

    return validateCrmBackup(parsedValue);
  } catch {
    return {
      valid: false as const,
      error: "Unable to read this file. Select a valid JSON backup.",
    };
  }
}

export async function restoreCrmBackup(backup: CrmBackup) {
  for (const storeName of BACKUP_STORE_NAMES) {
    const stateKey = BACKUP_STORE_STATE_KEYS[storeName];

    await localStorageAdapter.setItem(
      storeName,
      JSON.stringify({
        state: {
          [stateKey]: backup.data[stateKey],
        },
        version: 1,
      }),
    );
  }
}