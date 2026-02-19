export async function login(email: string, password: string) {
  const resp = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error("Usuario o contraseña inválidos");
  return await resp.json();
}
