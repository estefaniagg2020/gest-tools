export interface BusinessTypeOption {
  id: string;
  label: string;
  description?: string;
}

export const BUSINESS_TYPES: readonly BusinessTypeOption[] = [
  { id: "peluqueria", label: "Peluquería o barbería" },
  { id: "estetica", label: "Centro de estética" },
  { id: "spa", label: "Spa o bienestar" },
  { id: "clinica", label: "Clínica o consultorio médico" },
  { id: "odontologia", label: "Clínica dental" },
  { id: "fisio", label: "Fisioterapia o rehabilitación" },
  { id: "psicologia", label: "Psicología o terapia" },
  { id: "taller", label: "Taller mecánico o de reparaciones" },
  { id: "abogacia", label: "Despacho de abogados o asesoría" },
  { id: "otro", label: "Otro negocio con agenda" },
] as const;
