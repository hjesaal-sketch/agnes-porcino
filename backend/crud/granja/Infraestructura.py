// src/services/granjaInfraestructuraService.ts
export type ZonaGranja = {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "Productiva" | "Administrativa" | "Servicios" | "Biodiversidad" | "Otro";
  ubicacionGPS: string; // formato: "lat,lon"
  areaM2: number;
  observaciones: string;
};

const STORAGE_KEY = "granja_infraestructura";

function getAll(): ZonaGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: ZonaGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getZonas() {
  return getAll();
}

export function addZona(zona: Omit<ZonaGranja, "id">) {
  const nueva: ZonaGranja = { ...zona, id: crypto.randomUUID() };
  const zonas = getAll();
  zonas.push(nueva);
  saveAll(zonas);
  return nueva;
}

export function updateZona(id: string, zona: Omit<ZonaGranja, "id">) {
  const zonas = getAll();
  const idx = zonas.findIndex(z => z.id === id);
  if (idx >= 0) {
    zonas[idx] = { ...zona, id };
    saveAll(zonas);
    return zonas[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteZona(id: string) {
  const zonas = getAll().filter(z => z.id !== id);
  saveAll(zonas);
}
