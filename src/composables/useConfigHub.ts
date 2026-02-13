export interface ConfigHubCardItem {
  id: string;
  to: string;
  title: string;
  description: string;
  icon: string;
  accent: "teal" | "violet" | "amber" | "sky" | "rose";
}

const CONFIG_CARDS: readonly ConfigHubCardItem[] = [
  {
    id: "datos",
    to: "/config/wizard",
    title: "Datos del gestor",
    description: "Empresa, equipo, actividad y contacto.",
    icon: "📋",
    accent: "teal",
  },
  {
    id: "temas",
    to: "/config/temas",
    title: "Temas",
    description: "Apariencia, claro u oscuro.",
    icon: "🎨",
    accent: "violet",
  },
  {
    id: "grid",
    to: "/config/grid",
    title: "Diseño de la cuadrícula",
    description: "Columnas, vistas y disposición a tu gusto.",
    icon: "▦",
    accent: "amber",
  },
  {
    id: "marca",
    to: "/settings",
    title: "Marca y logo",
    description: "Nombre de la empresa e imagen.",
    icon: "🖼",
    accent: "sky",
  },
  {
    id: "notificaciones",
    to: "/config/notificaciones",
    title: "Notificaciones",
    description: "Recordatorios y avisos.",
    icon: "🔔",
    accent: "rose",
  },
];

export const useConfigHub = () => ({
  cards: CONFIG_CARDS,
});
