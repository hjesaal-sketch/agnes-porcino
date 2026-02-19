// src/services/granjaDocumentacionService.ts
export type DocumentoGranja = {
  id: string;
  tipo: "Permiso" | "Licencia" | "Auditoría" | "Certificado" | "Manual" | "Otro";
  nombre: string;
  emisor: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: "Vigente" | "Vencido" | "Pendiente";
  anexos: string;
  observaciones: string;
};

const STORAGE_KEY = "granja_documentacion";

function getAll(): DocumentoGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: DocumentoGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getDocumentos() {
  return getAll();
}

export function addDocumento(doc: Omit<DocumentoGranja, "id">) {
  const nuevo: DocumentoGranja = { ...doc, id: crypto.randomUUID() };
  const docs = getAll();
  docs.push(nuevo);
  saveAll(docs);
  return nuevo;
}

export function updateDocumento(id: string, doc: Omit<DocumentoGranja, "id">) {
  const docs = getAll();
  const idx = docs.findIndex(d => d.id === id);
  if (idx >= 0) {
    docs[idx] = { ...doc, id };
    saveAll(docs);
    return docs[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteDocumento(id: string) {
  const docs = getAll().filter(d => d.id !== id);
  saveAll(docs);
}
