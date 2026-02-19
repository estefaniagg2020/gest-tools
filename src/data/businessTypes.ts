export interface BusinessTypeOption {
  id: string;
  label: string;
  description?: string;
}

export const BUSINESS_TYPES: readonly BusinessTypeOption[] = [
  // Belleza y Estética
  { id: "peluqueria", label: "Peluquería o barbería" },
  { id: "estetica", label: "Centro de estética" },
  { id: "maquillaje", label: "Maquillaje profesional" },
  { id: "tatuajes", label: "Tatuajes y piercings" },
  { id: "spa", label: "Spa o bienestar" },
  
  // Bienestar y Salud (No médicos invasivos)
  { id: "fisio", label: "Fisioterapia o rehabilitación" },
  { id: "psicologia", label: "Psicología o terapia" },
  { id: "nutricion", label: "Nutrición o dietética" },
  { id: "logopedia", label: "Logopedia / Terapia del habla" },
  { id: "podologia", label: "Podología" },
  { id: "yoga_pilates", label: "Yoga, pilates o fitness" },
  
  // Educación y Academias
  { id: "academia_danza", label: "Academia de danza o baile" },
  { id: "academia_musica", label: "Academia de música" },
  { id: "clases_particulares", label: "Academia o clases particulares" },
  { id: "artes_marciales", label: "Artes marciales o defensa personal" },
  
  // Servicios Profesionales
  { id: "fotografia", label: "Fotografía o estudio" },
  { id: "coaching", label: "Coaching y desarrollo personal" },
  
  // Otros
  { id: "peluqueria_canina", label: "Peluquería canina" },
  { id: "otro", label: "Otro negocio con agenda" },
] as const;
