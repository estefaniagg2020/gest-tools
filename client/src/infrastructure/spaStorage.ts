import type { Spa } from "@/interfaces";

let memorySpaList: Spa[] | null = null;
let memoryCurrentSpaId: string | null = null;

/**
 * Adapter de persistencia para SPAs (memoria de sesión).
 * Única responsabilidad: leer y deserializar; sin lógica de negocio.
 */
export function loadStoredSpas(): Spa[] | null {
  return memorySpaList ? memorySpaList.map((spa) => ({ ...spa })) : null;
}

export function loadStoredCurrentSpaId(): string | null {
  return memoryCurrentSpaId;
}

export function saveSpaList(spas: Spa[]): void {
  memorySpaList = spas.map((spa) => ({ ...spa }));
}

export function saveCurrentSpaId(id: string): void {
  memoryCurrentSpaId = id;
}
