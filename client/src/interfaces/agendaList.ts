export interface AgendaEntry {
  name: string;
  startHour?: number;
  endHour?: number;
  workDaysPerWeek?: number;
}

export interface AgendaListConfig {
  numberOfAgendas: number;
  agendas: AgendaEntry[];
}
