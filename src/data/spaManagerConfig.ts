import type { ServiceCategory } from "@/interfaces";

export const THEME_COLORS = [
  { value: "teal", label: "Teal", bgClass: "bg-spa-teal" },
  { value: "purple", label: "Purple", bgClass: "bg-purple-500" },
  { value: "blue", label: "Blue", bgClass: "bg-blue-500" },
  { value: "orange", label: "Orange", bgClass: "bg-orange-500" },
  { value: "pink", label: "Pink", bgClass: "bg-pink-500" },
] as const;

export type ThemeColorValue = (typeof THEME_COLORS)[number]["value"];

export const SERVICE_CATEGORIES_FOR_SPA: {
  value: ServiceCategory;
  label: string;
  icon: string;
  borderClass: string;
}[] = [
  { value: "manual", label: "Tratamientos Manuales", icon: "🤲", borderClass: "border-orange-200" },
  { value: "hydrotherapy", label: "Hidroterapia", icon: "💧", borderClass: "border-blue-200" },
  { value: "aesthetic", label: "Estética", icon: "💅", borderClass: "border-pink-200" },
  { value: "wellness", label: "Bienestar y Salud", icon: "🧘", borderClass: "border-green-200" },
];

export const getThemeClasses = (color: string): string => {
  switch (color) {
    case "teal":
      return "bg-spa-teal shadow-spa-teal/20";
    case "purple":
      return "bg-purple-500 shadow-purple-500/20";
    case "blue":
      return "bg-blue-500 shadow-blue-500/20";
    case "orange":
      return "bg-orange-500 shadow-orange-500/20";
    case "pink":
      return "bg-pink-500 shadow-pink-500/20";
    default:
      return "bg-gray-500";
  }
};
