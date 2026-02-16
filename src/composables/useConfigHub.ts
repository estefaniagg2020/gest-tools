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
    to: "/config/datos",
    title: "Datos de tu empresa",
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
    id: "agenda",
    to: "/config/agenda",
    title: "Configuración de agenda",
    description: "Horario, días laborables y capacidad por franja.",
    icon: "📅",
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
  {
    id: "iconos",
    to: "/config/iconos",
    title: "Iconos del menú",
    description: "Calendarios, personas, servicios e inventario.",
    icon: "🎯",
    accent: "amber",
  },
];

export const useConfigHub = () => ({
  cards: CONFIG_CARDS,
});
