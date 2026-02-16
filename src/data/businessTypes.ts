export interface BusinessTypeOption {
  id: string;
  label: string;
  description?: string;
}

export const BUSINESS_TYPES: readonly BusinessTypeOption[] = [
  { id: "clinica", label: "Médico / consultorio o clínica" },
  { id: "veterinario", label: "Veterinaria o clínica veterinaria" },
  { id: "odontologia", label: "Clínica dental" },
  { id: "fisio", label: "Fisioterapia o rehabilitación" },
  { id: "psicologia", label: "Psicología o terapia" },
  { id: "nutricion", label: "Nutrición o dietética" },
  { id: "podologia", label: "Podología" },
  { id: "optica", label: "Óptica o optometría" },
  { id: "spa", label: "Spa o bienestar" },
  { id: "estetica", label: "Centro de estética" },
  { id: "peluqueria", label: "Peluquería o barbería" },
  { id: "taller", label: "Taller mecánico o de reparaciones" },
  { id: "abogacia", label: "Despacho de abogados o asesoría" },
  { id: "educacion", label: "Academia, clases o formación" },
  { id: "otro", label: "Otro negocio con agenda" },
] as const;
