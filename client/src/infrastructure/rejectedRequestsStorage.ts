import type { RejectedRequest } from "@/interfaces";

let memoryRejectedRequests: RejectedRequest[] = [];

export const loadRejectedRequests = (): RejectedRequest[] => {
  return memoryRejectedRequests.map((request) => ({ ...request }));
};

export const saveRejectedRequests = (requests: RejectedRequest[]): void => {
  memoryRejectedRequests = requests.map((request) => ({ ...request }));
};
