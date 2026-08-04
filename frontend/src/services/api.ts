//frontend/src/services/api.ts
import API_BASE from "../config/api";
import { clearSession } from "./session";

export type LoginUser = {
  id: number;
  nombre: string;
  email: string;
  role: string;
  empresa_id: number;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: LoginUser;
};

async function handleResponse(resp: Response): Promise<any> {
  if (resp.status === 401) {
    try {
      const data = await resp.json();
      const detail = data?.detail;

      if (detail === "Token expirado") {
        clearSession();
        // Redirigir al login y cortar el flujo.
        window.location.href = "/login";
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
      }

      // Otros 401 se manejan como error genérico.
      throw new Error(detail || "No autorizado");
    } catch {
      clearSession();
      window.location.href = "/login";
      throw new Error("No autorizado. Inicia sesión nuevamente.");
    }
  }

  if (!resp.ok) {
    let message = "Error en la solicitud";

    try {
      const data = await resp.json();
      message = data?.detail || message;
    } catch {
      // ignorar error de parseo, usar mensaje genérico
    }

    throw new Error(message);
  }

  return resp.json();
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const resp = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // Para login queremos el mismo comportamiento de errores genéricos,
  // pero sin limpiar sesión (ya viene "vacía").
  if (!resp.ok) {
    let message = "Usuario o contraseña inválidos";

    try {
      const data = await resp.json();
      message = data?.detail || message;
    } catch {
      // ignorar error de parseo
    }

    throw new Error(message);
  }

  return await resp.json();
}

export function getAccessToken(): string | null {
  return localStorage.getItem("token");
}

export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper genérico por si luego quieres centralizar fetches autenticados.
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<any> {
  const resp = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...getAuthHeaders(),
    },
  });

  return handleResponse(resp);
}
