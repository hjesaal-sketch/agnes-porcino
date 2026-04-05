import API_BASE from '../config/api';

// Warm up backend before login (Render free tier cold start fix)
export async function warmupBackend() {
  try {
    await fetch(`${API_BASE.replace('/api', '')}/ping`, { method: 'GET' });
  } catch (e) {
    console.log('Backend warmup attempt');
  }
}

export async function login(email: string, password: string) {
    const resp = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) throw new Error("Usuario o contraseña inválidos");
    return await resp.json();
}
