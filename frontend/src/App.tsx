import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// COMPONENTES GLOBALES
import Navbar from "./components/Navbar/Navbar";
import LoginForm from "./components/Forms/LoginForm";
import Dashboard from "./components/Dashboard/Dashboard";

// VISTAS PRINCIPALES
import Estadisticas from "./pages/Estadisticas/Estadisticas";
import Productividad from "./pages/Productividad/Productividad";
import Usuarios from "./pages/Usuarios/Usuarios";

// MÓDULOS PRINCIPALES QUE SÍ EXISTEN
import Gestacion from "./pages/Gestacion/Gestacion";
import Maternidad from "./pages/Maternidad/Maternidad";
import Insumos from "./pages/Insumos/Insumos";
import Granja from "./pages/Granja/Granja";
import Economico from "./pages/Economico/Economico";
import Reportes from "./pages/Reportes/Reportes";
import Genetica from "./pages/Genetica/Genetica";
import Sitio2 from "./pages/Sitio2/Sitio2";
import Sitio3 from "./pages/Sitio3/Sitio3";
import Animales from "./pages/Animales/Animales"; // NUEVO

type UserType = {
  id: number;
  nombre: string;
  email: string;
  role: string;
  empresa_id: number;
};

async function login(email: string, password: string) {
  const resp = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error("Usuario o contraseña inválidos");
  return await resp.json();
}

function saveSession(token: string, user: UserType) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
function getUserFromStorage(): UserType | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function AppRoutes() {
  const [user, setUser] = useState<UserType | null>(getUserFromStorage());
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const savedUser = getUserFromStorage();
      if (savedUser) setUser(savedUser);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoginError("");
    try {
      const result = await login(email, password);
      setUser(result.user);
      saveSession(result.token, result.user);
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearSession();
    navigate("/login");
  };

  return (
    <>
      <Navbar isAuthenticated={!!user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <LoginForm onLogin={handleLogin} errorMessage={loginError} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? <Dashboard isAuthenticated={!!user} /> : <Navigate to="/login" />
          }
        />

        {/* Módulos principales */}
        <Route
          path="/gestacion"
          element={user ? <Gestacion /> : <Navigate to="/login" />}
        />
        <Route
          path="/maternidad"
          element={user ? <Maternidad /> : <Navigate to="/login" />}
        />
        <Route
          path="/insumos"
          element={user ? <Insumos /> : <Navigate to="/login" />}
        />
        <Route
          path="/granja"
          element={user ? <Granja /> : <Navigate to="/login" />}
        />
        <Route
          path="/economico"
          element={user ? <Economico /> : <Navigate to="/login" />}
        />
        <Route
          path="/reportes"
          element={user ? <Reportes /> : <Navigate to="/login" />}
        />
        <Route
          path="/genetica"
          element={user ? <Genetica /> : <Navigate to="/login" />}
        />
        <Route
          path="/sitio2"
          element={user ? <Sitio2 /> : <Navigate to="/login" />}
        />
        <Route
          path="/sitio3"
          element={user ? <Sitio3 /> : <Navigate to="/login" />}
        />
        <Route
          path="/animales"
          element={user ? <Animales /> : <Navigate to="/login" />}
        />

        {/* Vistas extra */}
        <Route
          path="/productividad"
          element={user ? <Productividad /> : <Navigate to="/login" />}
        />
        <Route
          path="/estadisticas"
          element={user ? <Estadisticas /> : <Navigate to="/login" />}
        />
        <Route
          path="/usuarios"
          element={user ? <Usuarios /> : <Navigate to="/login" />}
        />

        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
