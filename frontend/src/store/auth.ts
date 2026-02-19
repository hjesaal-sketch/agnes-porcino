export function setAuth(token: string, user: any) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
export function getToken(): string | null {
  return localStorage.getItem("token");
}
export function getUser(): any {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
