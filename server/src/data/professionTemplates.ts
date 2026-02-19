export interface ProfessionServiceDef {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export interface ProfessionCategoryDef {
  id: string;
  label: string;
  icon: string;
  services: ProfessionServiceDef[];
}

export interface ProfessionDef {
  label: string;
  categories: ProfessionCategoryDef[];
}

export const PROFESSION_TEMPLATES: Record<string, ProfessionDef> = {
  peluqueria: {
    label: "Peluquería o barbería",
    categories: [
      {
        id: "peluqueria-corte",
        label: "Corte y barbería",
        icon: "✂️",
        services: [
          { id: "peluqueria-corte-caballero", name: "Corte caballero / Barbería", duration: 30, price: 18 },
          { id: "peluqueria-lavar-cortar", name: "Lavar, cortar y peinar (mujer)", duration: 60, price: 28 },
        ],
      },
      {
        id: "peluqueria-color",
        label: "Color y tratamientos",
        icon: "🎨",
        services: [
          { id: "peluqueria-tinte", name: "Tinte / Coloración", duration: 90, price: 50 },
          { id: "peluqueria-mechas", name: "Mechas / Balayage", duration: 165, price: 85 },
        ],
      },
      {
        id: "peluqueria-unas",
        label: "Uñas",
        icon: "💅",
        services: [
          { id: "peluqueria-manicura-semi", name: "Manicura semi-permanente", duration: 45, price: 25 },
        ],
      },
    ],
  },

  estetica: {
    label: "Centro de estética",
    categories: [
      {
        id: "estetica-depilacion",
        label: "Depilación",
        icon: "✨",
        services: [
          { id: "estetica-depilacion-laser-piernas", name: "Depilación láser piernas completas", duration: 45, price: 60 },
          { id: "estetica-depilacion-laser-axilas", name: "Depilación láser axilas", duration: 20, price: 25 },
          { id: "estetica-depilacion-cera-piernas", name: "Depilación con cera piernas", duration: 30, price: 22 },
          { id: "estetica-depilacion-cera-axilas", name: "Depilación con cera axilas", duration: 15, price: 12 },
          { id: "estetica-depilacion-cera-bikini", name: "Depilación con cera bikini", duration: 20, price: 18 },
        ],
      },
      {
        id: "estetica-facial",
        label: "Tratamientos faciales",
        icon: "🧴",
        services: [
          { id: "estetica-limpieza-facial", name: "Limpieza facial profunda", duration: 60, price: 50 },
          { id: "estetica-antiedad", name: "Tratamiento antiedad", duration: 75, price: 80 },
          { id: "estetica-microblading", name: "Microblading cejas", duration: 120, price: 150, description: "Técnica semipermanente para definir cejas." },
        ],
      },
      {
        id: "estetica-unas",
        label: "Uñas",
        icon: "💅",
        services: [
          { id: "estetica-manicura", name: "Manicura", duration: 45, price: 25 },
          { id: "estetica-pedicura", name: "Pedicura", duration: 60, price: 35 },
          { id: "estetica-manicura-semipermanente", name: "Manicura semipermanente", duration: 60, price: 35 },
        ],
      },
      {
        id: "estetica-corporal",
        label: "Tratamientos corporales",
        icon: "🌿",
        services: [
          { id: "estetica-envoltura", name: "Envoltura corporal", duration: 60, price: 65 },
        ],
      },
    ],
  },

  spa: {
    label: "Spa o bienestar",
    categories: [
      {
        id: "spa-masajes",
        label: "Masajes",
        icon: "🤲",
        services: [
          { id: "spa-masaje-relajante-60", name: "Masaje relajante 60 min", duration: 60, price: 60, description: "Masaje suave para reducir el estrés." },
          { id: "spa-masaje-relajante-90", name: "Masaje relajante 90 min", duration: 90, price: 85 },
          { id: "spa-masaje-descontracturante", name: "Masaje descontracturante", duration: 50, price: 70, description: "Masaje intenso para zonas de tensión." },
          { id: "spa-masaje-piedras", name: "Masaje con piedras calientes", duration: 75, price: 80 },
          { id: "spa-masaje-pareja", name: "Masaje de pareja", duration: 60, price: 110 },
        ],
      },
      {
        id: "spa-circuitos",
        label: "Circuitos y baños",
        icon: "🌊",
        services: [
          { id: "spa-circuito-aguas", name: "Circuito de aguas", duration: 90, price: 35, description: "Acceso a piscinas, sauna y baño turco." },
          { id: "spa-hidromasaje", name: "Bañera de hidromasaje", duration: 30, price: 25 },
        ],
      },
      {
        id: "spa-corporal",
        label: "Tratamientos corporales",
        icon: "🌿",
        services: [
          { id: "spa-exfoliacion", name: "Exfoliación corporal", duration: 45, price: 55 },
          { id: "spa-envoltura-algas", name: "Envoltura de algas", duration: 60, price: 70 },
        ],
      },
    ],
  },

  odontologia: {
    label: "Clínica dental",
    categories: [
      {
        id: "odontologia-general",
        label: "Odontología general",
        icon: "🦷",
        services: [
          { id: "odontologia-limpieza-bucal", name: "Limpieza bucal (profilaxis)", duration: 45, price: 55 },
          { id: "odontologia-empaste", name: "Empaste", duration: 45, price: 75 },
          { id: "odontologia-endodoncia", name: "Endodoncia", duration: 90, price: 180 },
        ],
      },
      {
        id: "odontologia-revision",
        label: "Revisión y diagnóstico",
        icon: "🔍",
        services: [
          { id: "odontologia-revision-diagnostico", name: "Revisión y diagnóstico", duration: 20, price: 35 },
          { id: "odontologia-ortodoncia-ajuste", name: "Ortodoncia (ajuste mensual)", duration: 15, price: 45 },
        ],
      },
    ],
  },

  taller: {
    label: "Taller mecánico o de reparaciones",
    categories: [
      {
        id: "taller-reparaciones",
        label: "Reparaciones",
        icon: "🔧",
        services: [
          { id: "taller-cambio-aceite", name: "Cambio de aceite y filtros", duration: 60, price: 55 },
          { id: "taller-pastillas-freno", name: "Cambio de pastillas de freno", duration: 90, price: 120 },
        ],
      },
      {
        id: "taller-revisiones",
        label: "Revisiones e ITV",
        icon: "🔍",
        services: [
          { id: "taller-revision-oficial", name: "Revisión oficial / Mantenimiento", duration: 120, price: 80 },
          { id: "taller-diagnosis", name: "Diagnosis de avería", duration: 45, price: 40 },
          { id: "taller-itv", name: "Preparación para la ITV", duration: 60, price: 50 },
        ],
      },
    ],
  },

  fisio: {
    label: "Fisioterapia o rehabilitación",
    categories: [
      {
        id: "fisio-sesiones",
        label: "Sesiones",
        icon: "🏥",
        services: [
          { id: "fisio-sesion-general", name: "Sesión de fisioterapia (general)", duration: 50, price: 48 },
          { id: "fisio-primera-consulta", name: "Primera consulta / Valoración", duration: 60, price: 55 },
        ],
      },
      {
        id: "fisio-terapias",
        label: "Terapias manuales",
        icon: "🤲",
        services: [
          { id: "fisio-masaje-descarga", name: "Masaje de descarga", duration: 45, price: 45 },
          { id: "fisio-drenaje-linfatico", name: "Drenaje linfático", duration: 60, price: 50 },
        ],
      },
    ],
  },

  veterinario: {
    label: "Veterinaria o clínica veterinaria",
    categories: [
      {
        id: "veterinario-consulta",
        label: "Consulta",
        icon: "🐾",
        services: [
          { id: "veterinario-consulta-general", name: "Consulta general / Vacunación", duration: 20, price: 35 },
          { id: "veterinario-desparasitacion", name: "Desparasitación interna/externa", duration: 15, price: 25 },
        ],
      },
      {
        id: "veterinario-cuidados",
        label: "Cuidados",
        icon: "✂️",
        services: [
          { id: "veterinario-corte-unas", name: "Corte de uñas", duration: 10, price: 12 },
        ],
      },
      {
        id: "veterinario-pruebas",
        label: "Pruebas y cirugía",
        icon: "🏥",
        services: [
          { id: "veterinario-ecografia", name: "Ecografía", duration: 45, price: 55 },
          { id: "veterinario-cirugia", name: "Cirugía (bloqueo de mañana)", duration: 180, price: 0, description: "Requiere bloqueo de mañana completa. Indicar precio según intervención." },
        ],
      },
    ],
  },

  clinica: {
    label: "Médico / consultorio o clínica",
    categories: [
      {
        id: "clinica-consultas",
        label: "Consultas",
        icon: "🏥",
        services: [
          { id: "clinica-primera-consulta", name: "Primera consulta", duration: 60, price: 80 },
          { id: "clinica-consulta-seguimiento", name: "Consulta de seguimiento", duration: 30, price: 50 },
          { id: "clinica-revision", name: "Revisión rápida", duration: 15, price: 30 },
        ],
      },
    ],
  },

  nutricion: {
    label: "Nutrición o dietética",
    categories: [
      {
        id: "nutricion-consultas",
        label: "Consultas",
        icon: "🥗",
        services: [
          { id: "nutricion-primera-consulta", name: "Primera consulta nutricional", duration: 60, price: 70 },
          { id: "nutricion-seguimiento", name: "Seguimiento nutricional", duration: 30, price: 45 },
          { id: "nutricion-plan", name: "Plan dietético personalizado", duration: 45, price: 55 },
        ],
      },
    ],
  },

  psicologia: {
    label: "Psicología o terapia",
    categories: [
      {
        id: "psicologia-terapia",
        label: "Sesiones de terapia",
        icon: "🧠",
        services: [
          { id: "psicologia-primera-sesion", name: "Primera sesión / evaluación", duration: 60, price: 80 },
          { id: "psicologia-sesion-individual", name: "Sesión individual", duration: 50, price: 70 },
          { id: "psicologia-sesion-pareja", name: "Sesión de pareja", duration: 60, price: 90 },
        ],
      },
    ],
  },
};
