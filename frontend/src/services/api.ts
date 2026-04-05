import API_BASE from '../config/api';

// DISABLED warmupBackend - testing direct loginexport async function warmupBackend() {
/*
export async function warmupBackend() {
  console.log('Warmup disabled for testing');
}
*/
export async function login(email: string, password: string) {
    const resp = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) throw new Error("Usuario o contraseña inválidos");
    return await resp.json();
}
