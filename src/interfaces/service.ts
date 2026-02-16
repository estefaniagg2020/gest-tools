export interface ServiceCategoryDefinition {
  id: string;
  label: string;
  icon: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
  requiresCabin?: boolean;
  requiresTherapist?: boolean;
  employeesCount?: number;
}
