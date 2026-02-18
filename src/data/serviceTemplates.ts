export interface ServiceTemplate {
  name: string;
  duration: number;
  price: number;
  description?: string;
  suggestedCategory: string;
  suggestedCategoryIcon: string;
}

export interface BusinessServiceTemplates {
  categories: Array<{ id: string; label: string; icon: string }>;
  services: ServiceTemplate[];
  requiresCabin: boolean;
  requiresStaff: boolean;
}

const TEMPLATES: Partial<Record<string, BusinessServiceTemplates>> = {
  peluqueria: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "corte", label: "Corte", icon: "✂️" },
      { id: "color", label: "Color y tratamientos", icon: "🎨" },
      { id: "peinado", label: "Peinado", icon: "💇" },
    ],
    services: [
      { name: "Corte caballero", duration: 30, price: 15, suggestedCategory: "corte", suggestedCategoryIcon: "✂️" },
      { name: "Corte señora", duration: 45, price: 25, suggestedCategory: "corte", suggestedCategoryIcon: "✂️" },
      { name: "Corte infantil", duration: 20, price: 12, suggestedCategory: "corte", suggestedCategoryIcon: "✂️" },
      { name: "Tinte completo", duration: 90, price: 45, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Mechas", duration: 120, price: 65, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Balayage", duration: 150, price: 85, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Lavado y brushing", duration: 45, price: 22, suggestedCategory: "peinado", suggestedCategoryIcon: "💇" },
      { name: "Permanente", duration: 120, price: 55, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Tratamiento capilar", duration: 45, price: 30, description: "Hidratación o reparación intensiva.", suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Alisado keratina", duration: 180, price: 120, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
    ],
  },
  estetica: {
    requiresCabin: true,
    requiresStaff: true,
    categories: [
      { id: "depilacion", label: "Depilación", icon: "✨" },
      { id: "facial", label: "Tratamientos faciales", icon: "🧴" },
      { id: "unas", label: "Uñas", icon: "💅" },
      { id: "corporal", label: "Tratamientos corporales", icon: "🌿" },
    ],
    services: [
      { name: "Depilación láser piernas completas", duration: 45, price: 60, suggestedCategory: "depilacion", suggestedCategoryIcon: "✨" },
      { name: "Depilación láser axilas", duration: 20, price: 25, suggestedCategory: "depilacion", suggestedCategoryIcon: "✨" },
      { name: "Depilación con cera piernas", duration: 30, price: 22, suggestedCategory: "depilacion", suggestedCategoryIcon: "✨" },
      { name: "Depilación con cera axilas", duration: 15, price: 12, suggestedCategory: "depilacion", suggestedCategoryIcon: "✨" },
      { name: "Depilación con cera bikini", duration: 20, price: 18, suggestedCategory: "depilacion", suggestedCategoryIcon: "✨" },
      { name: "Limpieza facial profunda", duration: 60, price: 50, suggestedCategory: "facial", suggestedCategoryIcon: "🧴" },
      { name: "Tratamiento antiedad", duration: 75, price: 80, suggestedCategory: "facial", suggestedCategoryIcon: "🧴" },
      { name: "Microblading cejas", duration: 120, price: 150, description: "Técnica semipermanente para definir cejas.", suggestedCategory: "facial", suggestedCategoryIcon: "🧴" },
      { name: "Manicura", duration: 45, price: 25, suggestedCategory: "unas", suggestedCategoryIcon: "💅" },
      { name: "Pedicura", duration: 60, price: 35, suggestedCategory: "unas", suggestedCategoryIcon: "💅" },
      { name: "Manicura semipermanente", duration: 60, price: 35, suggestedCategory: "unas", suggestedCategoryIcon: "💅" },
      { name: "Envoltura corporal", duration: 60, price: 65, suggestedCategory: "corporal", suggestedCategoryIcon: "🌿" },
    ],
  },
  spa: {
    requiresCabin: true,
    requiresStaff: true,
    categories: [
      { id: "masajes", label: "Masajes", icon: "🤲" },
      { id: "circuitos", label: "Circuitos y baños", icon: "🌊" },
      { id: "facial", label: "Tratamientos faciales", icon: "🧴" },
      { id: "corporal", label: "Tratamientos corporales", icon: "🌿" },
    ],
    services: [
      { name: "Masaje relajante 60 min", duration: 60, price: 60, description: "Masaje suave para reducir el estrés.", suggestedCategory: "masajes", suggestedCategoryIcon: "🤲" },
      { name: "Masaje relajante 90 min", duration: 90, price: 85, suggestedCategory: "masajes", suggestedCategoryIcon: "🤲" },
      { name: "Masaje descontracturante", duration: 50, price: 70, description: "Masaje intenso para zonas de tensión.", suggestedCategory: "masajes", suggestedCategoryIcon: "🤲" },
      { name: "Masaje con piedras calientes", duration: 75, price: 80, suggestedCategory: "masajes", suggestedCategoryIcon: "🤲" },
      { name: "Masaje de pareja", duration: 60, price: 110, suggestedCategory: "masajes", suggestedCategoryIcon: "🤲" },
      { name: "Circuito de aguas", duration: 90, price: 35, description: "Acceso a piscinas, sauna y baño turco.", suggestedCategory: "circuitos", suggestedCategoryIcon: "🌊" },
      { name: "Bañera de hidromasaje", duration: 30, price: 25, suggestedCategory: "circuitos", suggestedCategoryIcon: "🌊" },
      { name: "Tratamiento facial anti-edad", duration: 75, price: 90, suggestedCategory: "facial", suggestedCategoryIcon: "🧴" },
      { name: "Exfoliación corporal", duration: 45, price: 55, suggestedCategory: "corporal", suggestedCategoryIcon: "🌿" },
      { name: "Envoltura de algas", duration: 60, price: 70, suggestedCategory: "corporal", suggestedCategoryIcon: "🌿" },
    ],
  },
  fisio: {
    requiresCabin: true,
    requiresStaff: true,
    categories: [
      { id: "sesiones", label: "Sesiones", icon: "🏥" },
      { id: "terapias", label: "Terapias manuales", icon: "🤲" },
    ],
    services: [
      { name: "Primera consulta / valoración", duration: 60, price: 55, suggestedCategory: "sesiones", suggestedCategoryIcon: "🏥" },
      { name: "Sesión de fisioterapia", duration: 45, price: 45, suggestedCategory: "sesiones", suggestedCategoryIcon: "🏥" },
      { name: "Masaje terapéutico", duration: 45, price: 45, suggestedCategory: "terapias", suggestedCategoryIcon: "🤲" },
      { name: "Electroterapia", duration: 30, price: 35, suggestedCategory: "sesiones", suggestedCategoryIcon: "🏥" },
      { name: "Punción seca", duration: 30, price: 40, suggestedCategory: "terapias", suggestedCategoryIcon: "🤲" },
      { name: "Osteopatía", duration: 60, price: 60, suggestedCategory: "terapias", suggestedCategoryIcon: "🤲" },
    ],
  },
  clinica: {
    requiresCabin: true,
    requiresStaff: true,
    categories: [
      { id: "consultas", label: "Consultas", icon: "🏥" },
      { id: "pruebas", label: "Pruebas y revisiones", icon: "🔬" },
    ],
    services: [
      { name: "Primera consulta", duration: 60, price: 80, suggestedCategory: "consultas", suggestedCategoryIcon: "🏥" },
      { name: "Consulta de seguimiento", duration: 30, price: 50, suggestedCategory: "consultas", suggestedCategoryIcon: "🏥" },
      { name: "Revisión rápida", duration: 15, price: 30, suggestedCategory: "pruebas", suggestedCategoryIcon: "🔬" },
    ],
  },
  nutricion: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "consultas", label: "Consultas", icon: "🥗" },
    ],
    services: [
      { name: "Primera consulta nutricional", duration: 60, price: 70, suggestedCategory: "consultas", suggestedCategoryIcon: "🥗" },
      { name: "Seguimiento nutricional", duration: 30, price: 45, suggestedCategory: "consultas", suggestedCategoryIcon: "🥗" },
      { name: "Plan dietético personalizado", duration: 45, price: 55, suggestedCategory: "consultas", suggestedCategoryIcon: "🥗" },
    ],
  },
  psicologia: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "terapia", label: "Sesiones de terapia", icon: "🧠" },
    ],
    services: [
      { name: "Primera sesión / evaluación", duration: 60, price: 80, suggestedCategory: "terapia", suggestedCategoryIcon: "🧠" },
      { name: "Sesión individual", duration: 50, price: 70, suggestedCategory: "terapia", suggestedCategoryIcon: "🧠" },
      { name: "Sesión de pareja", duration: 60, price: 90, suggestedCategory: "terapia", suggestedCategoryIcon: "🧠" },
    ],
  },
  odontologia: {
    requiresCabin: true,
    requiresStaff: true,
    categories: [
      { id: "general", label: "Odontología general", icon: "🦷" },
      { id: "estetica-dental", label: "Estética dental", icon: "✨" },
    ],
    services: [
      { name: "Revisión y limpieza dental", duration: 45, price: 60, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Empaste", duration: 45, price: 80, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Extracción", duration: 30, price: 70, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Blanqueamiento dental", duration: 60, price: 150, suggestedCategory: "estetica-dental", suggestedCategoryIcon: "✨" },
      { name: "Ortodoncia (revisión)", duration: 30, price: 50, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
    ],
  },
  taller: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "reparaciones", label: "Reparaciones", icon: "🔧" },
      { id: "revisiones", label: "Revisiones", icon: "🔍" },
    ],
    services: [
      { name: "Cambio de aceite y filtros", duration: 60, price: 60, suggestedCategory: "reparaciones", suggestedCategoryIcon: "🔧" },
      { name: "Revisión pre-ITV", duration: 90, price: 50, suggestedCategory: "revisiones", suggestedCategoryIcon: "🔍" },
      { name: "Cambio de neumáticos (4 ruedas)", duration: 45, price: 40, suggestedCategory: "reparaciones", suggestedCategoryIcon: "🔧" },
      { name: "Diagnosis electrónica", duration: 30, price: 35, suggestedCategory: "revisiones", suggestedCategoryIcon: "🔍" },
    ],
  },
};

const DEFAULT_REQUIRES: Pick<BusinessServiceTemplates, "requiresCabin" | "requiresStaff"> = {
  requiresCabin: false,
  requiresStaff: true,
};

export const getServiceTemplates = (businessType: string): BusinessServiceTemplates | null =>
  TEMPLATES[businessType] ?? null;

export const getBusinessServiceDefaults = (businessType: string) =>
  TEMPLATES[businessType]
    ? { requiresCabin: TEMPLATES[businessType]!.requiresCabin, requiresStaff: TEMPLATES[businessType]!.requiresStaff }
    : { ...DEFAULT_REQUIRES };
