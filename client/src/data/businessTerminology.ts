export interface BusinessTerminology {
  staffPlural: string;
  staffSingular: string;
  staffSingularLower: string;
  locationLabel: string;
  noLocation: string;
  roleEmployee: string;
  locationAssignLabel: string;
  resourceLabel: string;
  tipOfTheDay: string;
  capacityDescription: string;
  deleteConfirm: string;
  pageSubtitle: string;
}

const DEFAULT_TERMINOLOGY: BusinessTerminology = {
  staffPlural: "Terapeutas",
  staffSingular: "Terapeuta",
  staffSingularLower: "terapeuta",
  locationLabel: "Spa",
  noLocation: "Sin asignar",
  roleEmployee: "Terapeuta",
  locationAssignLabel: "Spa asignado",
  resourceLabel: "Cabina",
  tipOfTheDay: "Agrupa tratamientos similares en la misma sala para reducir tiempos.",
  capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios terapeutas comparten franja).",
  deleteConfirm: "¿Estás seguro de que quieres eliminar este terapeuta?",
  pageSubtitle: "Gestiona el equipo de profesionales",
};

const withDefaults = (t: Partial<BusinessTerminology>): BusinessTerminology => ({
  ...DEFAULT_TERMINOLOGY,
  ...t,
  locationAssignLabel: t.locationAssignLabel ?? `${t.locationLabel ?? DEFAULT_TERMINOLOGY.locationLabel} asignado`,
  resourceLabel: t.resourceLabel ?? DEFAULT_TERMINOLOGY.resourceLabel,
  deleteConfirm: t.deleteConfirm ?? `¿Estás seguro de que quieres eliminar este ${t.staffSingularLower ?? DEFAULT_TERMINOLOGY.staffSingularLower}?`,
  pageSubtitle: t.pageSubtitle ?? "Gestiona el equipo de profesionales",
});

const TERMINOLOGY_BY_TYPE: Partial<Record<string, BusinessTerminology>> = {
  clinica: withDefaults({
    staffPlural: "Médicos",
    staffSingular: "Médico",
    staffSingularLower: "médico",
    locationLabel: "Clínica",
    noLocation: "Sin clínica",
    roleEmployee: "Médico",
    locationAssignLabel: "Clínica asignada",
    tipOfTheDay: "Agrupa consultas del mismo tipo en la misma consulta para optimizar el tiempo.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios médicos comparten consultorio).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este médico?",
    pageSubtitle: "Gestiona el equipo de médicos y personal",
  }),
  veterinario: withDefaults({
    staffPlural: "Veterinarios",
    staffSingular: "Veterinario",
    staffSingularLower: "veterinario",
    locationLabel: "Clínica",
    noLocation: "Sin clínica",
    roleEmployee: "Veterinario",
    locationAssignLabel: "Clínica asignada",
    tipOfTheDay: "Agrupa consultas por tipo de animal o sala para reducir esperas.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios veterinarios comparten consulta).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este veterinario?",
    pageSubtitle: "Gestiona el equipo de veterinarios y personal",
  }),
  odontologia: withDefaults({
    staffPlural: "Dentistas",
    staffSingular: "Dentista",
    staffSingularLower: "dentista",
    locationLabel: "Clínica",
    noLocation: "Sin clínica",
    roleEmployee: "Dentista",
    locationAssignLabel: "Clínica asignada",
    tipOfTheDay: "Agrupa tratamientos similares en el mismo gabinete para reducir tiempos.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios dentistas comparten gabinete).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este dentista?",
    pageSubtitle: "Gestiona el equipo de dentistas y personal",
  }),
  fisio: withDefaults({
    staffPlural: "Fisioterapeutas",
    staffSingular: "Fisioterapeuta",
    staffSingularLower: "fisioterapeuta",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Fisioterapeuta",
    tipOfTheDay: "Agrupa sesiones por tipo de terapia en la misma sala.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios fisioterapeutas comparten sala).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este fisioterapeuta?",
    pageSubtitle: "Gestiona el equipo de fisioterapeutas",
  }),
  psicologia: withDefaults({
    staffPlural: "Terapeutas",
    staffSingular: "Terapeuta",
    staffSingularLower: "terapeuta",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Terapeuta",
    tipOfTheDay: "Respeta los bloques entre sesiones para no solapar citas.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios terapeutas comparten despacho).",
    pageSubtitle: "Gestiona el equipo de terapeutas",
  }),
  nutricion: withDefaults({
    staffPlural: "Nutricionistas",
    staffSingular: "Nutricionista",
    staffSingularLower: "nutricionista",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Nutricionista",
    tipOfTheDay: "Deja tiempo entre consultas para preparar seguimientos.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios nutricionistas comparten consulta).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este nutricionista?",
    pageSubtitle: "Gestiona el equipo de nutricionistas",
  }),
  podologia: withDefaults({
    staffPlural: "Podólogos",
    staffSingular: "Podólogo",
    staffSingularLower: "podólogo",
    locationLabel: "Clínica",
    noLocation: "Sin clínica",
    roleEmployee: "Podólogo",
    tipOfTheDay: "Agrupa tratamientos por tipo en la misma sala.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios podólogos comparten consultorio).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este podólogo?",
    pageSubtitle: "Gestiona el equipo de podólogos",
  }),
  optica: withDefaults({
    staffPlural: "Optometristas",
    staffSingular: "Optometrista",
    staffSingularLower: "optometrista",
    locationLabel: "Establecimiento",
    noLocation: "Sin asignar",
    roleEmployee: "Optometrista",
    tipOfTheDay: "Agrupa revisiones y ventas en franjas consecutivas.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios optometristas comparten gabinete).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este optometrista?",
    pageSubtitle: "Gestiona el equipo de optometristas",
  }),
  spa: withDefaults({
    locationLabel: "Spa",
    noLocation: "Sin Spa",
    locationAssignLabel: "Spa asignado",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este terapeuta?",
  }),
  estetica: withDefaults({
    staffPlural: "Profesionales",
    staffSingular: "Profesional",
    staffSingularLower: "profesional",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Profesional",
    tipOfTheDay: "Agrupa tratamientos por tipo de técnica en la misma cabina.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios profesionales comparten cabina).",
    pageSubtitle: "Gestiona el equipo de profesionales",
  }),
  peluqueria: withDefaults({
    staffPlural: "Peluqueros",
    staffSingular: "Peluquero",
    staffSingularLower: "peluquero",
    locationLabel: "Salón",
    noLocation: "Sin asignar",
    roleEmployee: "Peluquero",
    tipOfTheDay: "Agrupa servicios similares en la misma postura para ganar tiempo.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios peluqueros comparten postura).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este peluquero?",
    pageSubtitle: "Gestiona el equipo de peluqueros",
  }),
  taller: withDefaults({
    staffPlural: "Mecánicos",
    staffSingular: "Mecánico",
    staffSingularLower: "mecánico",
    locationLabel: "Taller",
    noLocation: "Sin asignar",
    roleEmployee: "Mecánico",
    tipOfTheDay: "Agrupa reparaciones por tipo de vehículo o tipo de trabajo.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios mecánicos comparten puesto).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este mecánico?",
    pageSubtitle: "Gestiona el equipo de mecánicos",
  }),
  abogacia: withDefaults({
    staffPlural: "Abogados",
    staffSingular: "Abogado",
    staffSingularLower: "abogado",
    locationLabel: "Despacho",
    noLocation: "Sin asignar",
    roleEmployee: "Abogado",
    tipOfTheDay: "Deja bloques para preparar vistas y documentación.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios abogados comparten despacho).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este abogado?",
    pageSubtitle: "Gestiona el equipo de abogados",
  }),
  educacion: withDefaults({
    staffPlural: "Profesores",
    staffSingular: "Profesor",
    staffSingularLower: "profesor",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Profesor",
    tipOfTheDay: "Agrupa clases del mismo nivel o materia en el mismo aula.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios profesores comparten aula).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este profesor?",
    pageSubtitle: "Gestiona el equipo de profesores",
  }),
  otro: withDefaults({
    staffPlural: "Profesionales",
    staffSingular: "Profesional",
    staffSingularLower: "profesional",
    locationLabel: "Centro",
    noLocation: "Sin asignar",
    roleEmployee: "Profesional",
    resourceLabel: "Espacio",
    tipOfTheDay: "Organiza tu agenda por tipo de cita o cliente para ser más eficiente.",
    capacityDescription: "Cuántas personas pueden reservar la misma franja (p. ej. cuando varios profesionales comparten recurso).",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este profesional?",
    pageSubtitle: "Gestiona el equipo de profesionales",
  }),
};

export const getBusinessTerminology = (businessType: string): BusinessTerminology => {
  if (businessType && TERMINOLOGY_BY_TYPE[businessType]) {
    return TERMINOLOGY_BY_TYPE[businessType]!;
  }
  return DEFAULT_TERMINOLOGY;
};
