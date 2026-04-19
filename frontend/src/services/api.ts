import API_BASE from "../config/api";

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

export async function login(email: string, password: string): Promise<LoginResponse> {
  const resp = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    throw new Error("Usuario o contraseña inválidos");
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
