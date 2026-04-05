// frontend/src/services/Usuarios.ts
import API_BASE from "../config/api";

export type RolUsuario = "Dueño" | "Gerente General" | "Gerente de Granja" | "Operador" | "Administrador" | "Consultor" | "Maestro";

export type Usuario = {
  id: number;
  empresa_id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  ultima_sesion: string | null;
};

export type NuevoUsuario = Omit<Usuario, "id" | "empresa_id" | "ultima_sesion">;

const EMPRESA_ID = 1;

function mapApiToUsuario(api: any): Usuario {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    nombre: api.nombre,
    email: api.email,
    rol: api.rol,
    activo: api.activo,
    ultima_sesion: api.ultima_sesion ?? null,
  };
}

export async function getUsuarios(): Promise<Usuario[]> {
  const url = new URL(`${API_BASE}/usuarios/`, window.location.origin);
  url.searchParams.set("empresa_id", String(EMPRESA_ID));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al obtener usuarios");
  }

  const data = await res.json();
  return data.map(mapApiToUsuario);
}

export async function createUsuario(
  body: NuevoUsuario
): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/usuarios/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear usuario");
  }

  const data = await res.json();
  return mapApiToUsuario(data);
}

export async function updateUsuario(
  id: number,
  payload: Partial<Omit<NuevoUsuario, "empresa_id">>
): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar usuario");
  }

  const data = await res.json();
  return mapApiToUsuario(data);
}

export async function deleteUsuario(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar usuario");
  }
}
