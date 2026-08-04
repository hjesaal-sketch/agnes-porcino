// frontend/src/services/session.ts
export type UserType = {
  id: number;
  nombre: string;
  email: string;
  role: string;
  empresa_id: number;
};

export function saveSession(token: string, user: UserType) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("empresa_id", String(user.empresa_id));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("empresa_id");
}

export function getUserFromStorage(): UserType | null {
  const raw = localStorage.getItem("user");

  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function hasToken(): boolean {
  return !!localStorage.getItem("token");
}
