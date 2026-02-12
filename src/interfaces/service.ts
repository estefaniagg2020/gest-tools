export type ServiceCategory = "manual" | "hydrotherapy" | "aesthetic" | "wellness";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number;
  price: number;
  description?: string;
  requiresCabin?: boolean;
  requiresTherapist?: boolean;
}
