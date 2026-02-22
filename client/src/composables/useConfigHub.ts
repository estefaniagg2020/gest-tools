import type { ComputedRef } from "vue";
import { computed } from "vue";
import { useBillingConfig } from "@/composables/useBillingConfig";

export interface ConfigHubCardItem {
  id: string;
  to: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  accent: "teal" | "violet" | "amber" | "sky" | "rose";
}

const CONFIG_CARDS: readonly ConfigHubCardItem[] = [
  {
    id: "modules",
    to: "/config/modules",
    titleKey: "config.modules.title",
    descriptionKey: "config.modules.description",
    icon: "▦",
    accent: "amber",
  },
  {
    id: "datos",
    to: "/config/data",
    titleKey: "config.data.title",
    descriptionKey: "config.data.description",
    icon: "📋",
    accent: "teal",
  },
  {
    id: "temas",
    to: "/config/themes",
    titleKey: "config.themes.title",
    descriptionKey: "config.themes.description",
    icon: "🎨",
    accent: "violet",
  },
  {
    id: "grid",
    to: "/config/grid",
    titleKey: "config.grid.title",
    descriptionKey: "config.grid.description",
    icon: "▦",
    accent: "amber",
  },
  {
    id: "dashboard",
    to: "/config/dashboard",
    titleKey: "config.dashboard.title",
    descriptionKey: "config.dashboard.description",
    icon: "📊",
    accent: "sky",
  },
  {
    id: "agenda",
    to: "/config/agenda",
    titleKey: "config.agenda.title",
    descriptionKey: "config.agenda.description",
    icon: "📅",
    accent: "sky",
  },
  {
    id: "notificaciones",
    to: "/config/notifications",
    titleKey: "config.notifications.title",
    descriptionKey: "config.notifications.description",
    icon: "🔔",
    accent: "rose",
  },
  {
    id: "iconos",
    to: "/config/icons",
    titleKey: "config.icons.title",
    descriptionKey: "config.icons.description",
    icon: "🎯",
    accent: "amber",
  },
  {
    id: "idioma",
    to: "/config/language",
    titleKey: "config.language.title",
    descriptionKey: "config.language.description",
    icon: "🌐",
    accent: "teal",
  },
  {
    id: "bonos",
    to: "/config/bonos",
    titleKey: "config.bonos.title",
    descriptionKey: "config.bonos.description",
    icon: "🎫",
    accent: "violet",
  },
  {
    id: "billing",
    to: "/config/billing",
    titleKey: "config.billing.title",
    descriptionKey: "config.billing.description",
    icon: "🧾",
    accent: "teal",
  },
];

export const useConfigHub = (): { cards: ComputedRef<ConfigHubCardItem[]> } => {
  const { bonosEnabled } = useBillingConfig();
  // HIDDEN_FEATURE: bonos - Oculta tarjeta Config Bonos del hub si bonosEnabled=false
  const cards = computed(() =>
    CONFIG_CARDS.filter((card) => (card.id === "bonos" ? bonosEnabled.value : true))
  );
  return { cards };
};
