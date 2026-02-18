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

const DEFAULT_APP_COLORS: ThemeColors = {
  primary: "#187bcd",
  accent: "#0a6fb4",
  bg: "#f5f7fa",
  surface: "#ffffff",
  title: "#2c3e50",
  text: "#333333",
};

export const DEFAULT_THEME_ID = "azul";

export const DEFAULT_CUSTOM_THEME_COLORS: ThemeColors = { ...DEFAULT_APP_COLORS };

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "amarillo", label: "Amarillo", description: "Fondo y barra en tonos amarillos" },
  { id: "verde", label: "Verde", description: "Fondo y barra en tonos verdes" },
  { id: "azul", label: "Azul", description: "Fondo y barra en tonos azules" },
  { id: "azul-oscuro", label: "Azul oscuro", description: "Tema oscuro en azul" },
  { id: "rojo", label: "Rojo", description: "Fondo y barra en tonos rojos" },
  { id: "rosa", label: "Rosa", description: "Fondo y barra en tonos rosas" },
  { id: "minimal-premium", label: "Minimal premium", description: "Blanco, gris cálido y acento morado" },
  { id: "calido", label: "Cálido humano", description: "Crema y bordes suaves" },
  { id: "teal", label: "Teal", description: "Verde azulado" },
  { id: "claro", label: "Claro", description: "Blanco y grises suaves" },
  { id: "oscuro", label: "Oscuro", description: "Modo noche" },
  { id: "oceano", label: "Océano", description: "Azules profundos" },
  { id: "bosque", label: "Bosque", description: "Verdes naturales" },
  { id: "atardecer", label: "Atardecer", description: "Naranjas y cálidos" },
  { id: "lavanda", label: "Lavanda", description: "Violetas suaves" },
  { id: "coral", label: "Coral", description: "Rojos y rosas cálidos" },
  { id: "indigo", label: "Índigo", description: "Azul intenso" },
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
