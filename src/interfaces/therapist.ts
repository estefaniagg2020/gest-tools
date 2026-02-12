export type TherapistRole = "manager" | "therapist";

export interface Therapist {
  id: string;
  name: string;
  photoUrl: string;
  /** URL del perfil de LinkedIn (se persiste para enlazar foto y perfil). */
  linkedInUrl?: string;
  phoneNumber: string;
  email: string;
  weeklyHours: number;
  color: string;
  role: TherapistRole;
  spaId: string;
  /** Hora de inicio del horario laboral por defecto (0-24). */
  defaultWorkStartHour?: number;
  /** Hora de fin del horario laboral por defecto (0-24). */
  defaultWorkEndHour?: number;
}
