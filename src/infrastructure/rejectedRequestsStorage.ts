import type { RejectedRequest } from "@/interfaces";

const STORAGE_KEY = "spa-rejected-requests";

export const loadRejectedRequests = (): RejectedRequest[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRejectedRequests = (requests: RejectedRequest[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};
