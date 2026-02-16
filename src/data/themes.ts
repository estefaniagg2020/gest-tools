export interface ThemeOption {
  id: string;
  label: string;
  description?: string;
}

export interface ThemeColors {
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  title: string;
  text: string;
}

const MINIMAL_PREMIUM_DEFAULTS: ThemeColors = {
  primary: "#7c3aed",
  accent: "#6d28d9",
  bg: "#f5f5f5",
  surface: "#ffffff",
  title: "#1a1a1a",
  text: "#374151",
};

export const DEFAULT_THEME_ID = "minimal-premium";

export const DEFAULT_CUSTOM_THEME_COLORS: ThemeColors = { ...MINIMAL_PREMIUM_DEFAULTS };

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "minimal-premium", label: "Minimal premium", description: "Blanco, gris cálido y acento morado (Stripe)" },
  { id: "calido", label: "Cálido humano", description: "Crema y bordes suaves, ideal peluquería" },
  { id: "teal", label: "Teal", description: "Verde azulado" },
  { id: "claro", label: "Claro", description: "Blanco y grises suaves" },
  { id: "oscuro", label: "Oscuro", description: "Modo noche" },
  { id: "oceano", label: "Océano", description: "Azules profundos" },
  { id: "bosque", label: "Bosque", description: "Verdes naturales" },
  { id: "atardecer", label: "Atardecer", description: "Naranjas y cálidos" },
  { id: "lavanda", label: "Lavanda", description: "Violetas suaves" },
  { id: "coral", label: "Coral", description: "Rojos y rosas cálidos" },
  { id: "indigo", label: "Índigo", description: "Azul intenso" },
  { id: "rosa", label: "Rosa", description: "Rosa y magenta" },
  { id: "minimal", label: "Minimal", description: "Muy limpio, poco color" },
  { id: "arena", label: "Arena", description: "Beige y tierra" },
  { id: "esmeralda", label: "Esmeralda", description: "Verde esmeralda" },
  { id: "personalizado", label: "Personalizado", description: "Elige cada color a tu gusto" },
] as const;

export const CUSTOM_THEME_ID = "personalizado";

export const SYSTEM_PALETTE = {
  primary: "#6366f1",
  title: "#0f172a",
  text: "#475569",
} as const;
