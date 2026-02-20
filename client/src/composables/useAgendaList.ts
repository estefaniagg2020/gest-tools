import { storeToRefs } from "pinia";
import { useAgendaListStore } from "@/stores/agendaList";
import { AGENDA_LIST } from "@/data/constants";

export const useAgendaList = () => {
  const store = useAgendaListStore();
  const { numberOfAgendas, agendas, agendaNames } = storeToRefs(store);
  const { updateAgendaList, setAgendaName, setAgendaHours, setAgendaWorkDays, getAgenda, initialize } = store;

  return {
    numberOfAgendas,
    agendas,
    agendaNames,
    updateAgendaList,
    setAgendaName,
    setAgendaHours,
    setAgendaWorkDays,
    getAgenda,
    initialize,
    minAgendas: AGENDA_LIST.MIN_AGENDAS,
    maxAgendas: AGENDA_LIST.MAX_AGENDAS,
    labelHowMany: AGENDA_LIST.LABEL_HOW_MANY,
    labelAgendaNames: AGENDA_LIST.LABEL_AGENDA_NAMES,
    placeholderName: AGENDA_LIST.PLACEHOLDER_NAME,
    labelStartHour: AGENDA_LIST.LABEL_START_HOUR,
    labelEndHour: AGENDA_LIST.LABEL_END_HOUR,
    useGlobalHours: AGENDA_LIST.USE_GLOBAL_HOURS,
  };
};
