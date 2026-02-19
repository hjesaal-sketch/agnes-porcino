// src/services/granja/Documentacion.ts
import API_BASE from "../../config/api";

export type Documento = {
  id: number;
  fecha: string; // ISO yyyy-mm-dd
  tipo: string;
  titulo: string;
  descripcion: string;
  responsable: string;
  estado: string;
  observaciones: string;
  file_url?: string | null;
};

export type NuevoDocumento = Omit<Documento, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToDocumento(api: any): Documento {
  return {
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    titulo: api.titulo,
    descripcion: api.descripcion ?? "",
    responsable: api.responsable ?? "",
    estado: api.estado,
    observaciones: api.observaciones ?? "",
    file_url: api.file_url ?? null,
  };
}

async function handleJsonResponse(res: Response, defaultMsg: string) {
  if (!res.ok) {
    // Intenta leer detalle del backend para debug
    let detail = "";
    try {
      const errJson = await res.json();
      detail =
        typeof errJson === "string"
          ? errJson
          : errJson?.detail || JSON.stringify(errJson);
    } catch {
      // ignore JSON parse error
    }
    throw new Error(detail || defaultMsg);
  }
  return res.json();
}

export async function getDocumentos(): Promise<Documento[]> {
  const url = `${API_BASE}/granja/documentos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`;
  try {
    const res = await fetch(url);
    const data = await handleJsonResponse(res, "Error al obtener documentos");
    if (!Array.isArray(data)) {
      throw new Error("Respuesta inesperada al obtener documentos");
    }
    return data.map(mapApiToDocumento);
  } catch (err: any) {
    console.error("getDocumentos error:", err);
    throw err;
  }
}

export async function addDocumento(doc: NuevoDocumento): Promise<Documento> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: doc.fecha,
    tipo: doc.tipo,
    titulo: doc.titulo,
    descripcion: doc.descripcion,
    responsable: doc.responsable,
    estado: doc.estado,
    observaciones: doc.observaciones,
    file_url: doc.file_url,
  };

  const url = `${API_BASE}/granja/documentos/`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleJsonResponse(res, "Error al crear documento");
    return mapApiToDocumento(data);
  } catch (err: any) {
    console.error("addDocumento error:", err);
    throw err;
  }
}

export async function updateDocumento(
  id: number,
  doc: NuevoDocumento
): Promise<Documento> {
  const payload = {
    fecha: doc.fecha,
    tipo: doc.tipo,
    titulo: doc.titulo,
    descripcion: doc.descripcion,
    responsable: doc.responsable,
    estado: doc.estado,
    observaciones: doc.observaciones,
    file_url: doc.file_url,
  };

  const url = `${API_BASE}/granja/documentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleJsonResponse(res, "Error al actualizar documento");
    return mapApiToDocumento(data);
  } catch (err: any) {
    console.error("updateDocumento error:", err);
    throw err;
  }
}

export async function deleteDocumento(id: number): Promise<void> {
  const url = `${API_BASE}/granja/documentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`;

  try {
    const res = await fetch(url, { method: "DELETE" });
    await handleJsonResponse(res, "Error al eliminar documento");
  } catch (err: any) {
    console.error("deleteDocumento error:", err);
    throw err;
  }
}
