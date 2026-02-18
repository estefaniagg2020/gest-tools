export type TeamMemberRole = "manager" | "member";

export interface TeamMember {
  id: string;
  name: string;
  specialty?: string;
  photoUrl: string;
  linkedInUrl?: string;
  phoneNumber: string;
  email: string;
  weeklyHours: number;
  color: string;
  role: TeamMemberRole;
  spaId: string;
  defaultWorkStartHour?: number;
  defaultWorkEndHour?: number;
  birthDate?: string;
}
