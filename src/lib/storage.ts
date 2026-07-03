import type { StateStorage } from "zustand/middleware";

const STORAGE_PREFIX = "SK-Fitness-CRM";

function getStorageKey(name: string) {
  return `${STORAGE_PREFIX}:${name}`;
}

export const localStorageAdapter: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(getStorageKey(name));
  },

  setItem: (name, value) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getStorageKey(name), value);
  },

  removeItem: (name) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(getStorageKey(name));
  },
};

export function createId(prefix: string) {
  const randomPart = crypto.randomUUID().split("-")[0];
  return `${prefix}-${Date.now()}-${randomPart}`;
}