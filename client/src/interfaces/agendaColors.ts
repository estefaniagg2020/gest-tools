export interface AgendaColorSet {
  agendaBg: string;
  markedDaysColor: string;
  vacationColor: string;
}

export interface AgendaColorsConfig {
  sameColorsForAll: boolean;
  agendaBg: string;
  markedDaysColor: string;
  vacationColor: string;
  perAgendaColors?: AgendaColorSet[];
}

export const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
