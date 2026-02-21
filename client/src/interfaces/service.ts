export interface ServiceCategoryDefinition {
  id: string;
  label: string;
  icon: string;
}

export interface CatalogService {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string | null;
}

export interface CatalogCategory {
  id: string;
  label: string;
  icon: string;
  services: CatalogService[];
}

export interface Service {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  serviceCategory?: { id: string; label: string; icon: string };
  duration: number;
  price: number;
  description?: string;
  requiresCabin?: boolean;
  requiresTherapist?: boolean;
  employeesCount?: number;
}
