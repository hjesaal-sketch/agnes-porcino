// frontend/src/services/Sanidad.ts
import API_BASE from "../config/api";
import { getAuthHeaders } from "./api";

function getEmpresaId(): number {
  const empresaIdGuardado = localStorage.getItem("empresa_id");
  if (!empresaIdGuardado) {
    throw new Error("No se encontró la empresa del usuario actual.");
  }
  const empresa_id = Number(empresaIdGuardado);
  if (Number.isNaN(empresa_id)) {
    throw new Error("El identificador de empresa es inválido.");
  }
  return empresa_id;
}

const GRANJA_ID = 1;

export const getEventosSanitarios = async () => {
  const empresa_id = getEmpresaId();

  const url = new URL(
    `${API_BASE}/sanidad/eventos`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(empresa_id));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener eventos sanitarios");
  }

  return res.json();
};

export const crearEventoSanitario = async (data: any) => {
  const empresa_id = getEmpresaId();

  const body = {
    empresa_id,
    granja_id: GRANJA_ID,
    ...data,
  };

  const res = await fetch(`${API_BASE}/sanidad/eventos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Error al crear evento sanitario");
  }

  return res.json();
};