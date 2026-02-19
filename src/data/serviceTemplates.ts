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
      { id: "corte", label: "Corte y barbería", icon: "✂️" },
      { id: "color", label: "Color y tratamientos", icon: "🎨" },
      { id: "peinado", label: "Peinado", icon: "💇" },
      { id: "unas", label: "Uñas", icon: "💅" },
    ],
    services: [
      { name: "Corte caballero / Barbería", duration: 30, price: 18, suggestedCategory: "corte", suggestedCategoryIcon: "✂️" },
      { name: "Lavar, cortar y peinar (mujer)", duration: 60, price: 28, suggestedCategory: "peinado", suggestedCategoryIcon: "💇" },
      { name: "Tinte / Coloración", duration: 90, price: 50, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Mechas / Balayage", duration: 165, price: 85, suggestedCategory: "color", suggestedCategoryIcon: "🎨" },
      { name: "Manicura semi-permanente", duration: 45, price: 25, suggestedCategory: "unas", suggestedCategoryIcon: "💅" },
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
      { id: "revision", label: "Revisión y diagnóstico", icon: "🔍" },
    ],
    services: [
      { name: "Limpieza bucal (profilaxis)", duration: 45, price: 55, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Revisión y diagnóstico", duration: 20, price: 35, suggestedCategory: "revision", suggestedCategoryIcon: "🔍" },
      { name: "Empaste", duration: 45, price: 75, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Endodoncia", duration: 90, price: 180, suggestedCategory: "general", suggestedCategoryIcon: "🦷" },
      { name: "Ortodoncia (ajuste mensual)", duration: 15, price: 45, suggestedCategory: "revision", suggestedCategoryIcon: "🔍" },
    ],
  },
  taller: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "reparaciones", label: "Reparaciones", icon: "🔧" },
      { id: "revisiones", label: "Revisiones e ITV", icon: "🔍" },
    ],
    services: [
      { name: "Revisión oficial / Mantenimiento", duration: 120, price: 80, suggestedCategory: "revisiones", suggestedCategoryIcon: "🔍" },
      { name: "Cambio de aceite y filtros", duration: 60, price: 55, suggestedCategory: "reparaciones", suggestedCategoryIcon: "🔧" },
      { name: "Cambio de pastillas de freno", duration: 90, price: 120, suggestedCategory: "reparaciones", suggestedCategoryIcon: "🔧" },
      { name: "Diagnosis de avería", duration: 45, price: 40, suggestedCategory: "revisiones", suggestedCategoryIcon: "🔍" },
      { name: "Preparación para la ITV", duration: 60, price: 50, suggestedCategory: "revisiones", suggestedCategoryIcon: "🔍" },
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
      { name: "Sesión de fisioterapia (general)", duration: 50, price: 48, suggestedCategory: "sesiones", suggestedCategoryIcon: "🏥" },
      { name: "Primera consulta / Valoración", duration: 60, price: 55, suggestedCategory: "sesiones", suggestedCategoryIcon: "🏥" },
      { name: "Masaje de descarga", duration: 45, price: 45, suggestedCategory: "terapias", suggestedCategoryIcon: "🤲" },
      { name: "Drenaje linfático", duration: 60, price: 50, suggestedCategory: "terapias", suggestedCategoryIcon: "🤲" },
    ],
  },
  veterinario: {
    requiresCabin: false,
    requiresStaff: true,
    categories: [
      { id: "consulta", label: "Consulta", icon: "🐾" },
      { id: "cuidados", label: "Cuidados", icon: "✂️" },
      { id: "pruebas", label: "Pruebas y cirugía", icon: "🏥" },
    ],
    services: [
      { name: "Consulta general / Vacunación", duration: 20, price: 35, suggestedCategory: "consulta", suggestedCategoryIcon: "🐾" },
      { name: "Desparasitación interna/externa", duration: 15, price: 25, suggestedCategory: "cuidados", suggestedCategoryIcon: "✂️" },
      { name: "Corte de uñas", duration: 10, price: 12, suggestedCategory: "cuidados", suggestedCategoryIcon: "✂️" },
      { name: "Ecografía", duration: 45, price: 55, suggestedCategory: "pruebas", suggestedCategoryIcon: "🏥" },
      { name: "Cirugía (bloqueo de mañana)", duration: 180, price: 0, description: "Requiere bloqueo de mañana completa. Indicar precio según intervención.", suggestedCategory: "pruebas", suggestedCategoryIcon: "🏥" },
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

export const getSystemServiceNamesOfOtherTypes = (
  currentBusinessType: string,
): string[] => {
  const names: string[] = [];
  for (const [type, t] of Object.entries(TEMPLATES)) {
    if (type === currentBusinessType || !t) continue;
    for (const svc of t.services) names.push(svc.name);
  }
  return names;
};
