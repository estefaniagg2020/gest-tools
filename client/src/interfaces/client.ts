export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface ClientServiceStat {
  name: string;
  count: number;
  lastDate: string;
}

export interface ClientMatchedService {
  serviceId: string;
  serviceName: string;
  lastDate: string;
  totalTimes: number;
}

export type SpecialFilter = "debt" | "no_show" | null;

export interface ClientSearchResult {
  client: Client;
  lastVisit: string | null;
  lastVisitServiceName: string | null;
  lastVisitMemberName: string | null;
  totalVisits: number;
  topServices: ClientServiceStat[];
  matchedServiceHistory: ClientMatchedService | null;
  pendingAmount: number;
  noShowCount: number;
  noShowRate: number;
}

export interface ClientSearchResponse {
  results: ClientSearchResult[];
  query: string;
  specialFilter: SpecialFilter;
  serviceHint: string[];
}
