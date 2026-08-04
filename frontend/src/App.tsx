// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import LoginForm from "./components/Forms/LoginForm";
import Dashboard from "./components/Dashboard/Dashboard";
import { login as apiLogin } from "./services/api";
import Estadisticas from "./pages/Estadisticas/Estadisticas";
import Productividad from "./pages/Productividad/Productividad";
import Usuarios from "./pages/Usuarios/Usuarios";
import Gestacion from "./pages/Gestacion/Gestacion";
import Maternidad from "./pages/Maternidad/Maternidad";
import Insumos from "./pages/Insumos/Insumos";
import Granja from "./pages/Granja/Granja";
import Economico from "./pages/Economico/Economico";
import Reportes from "./pages/Reportes/Reportes";
import Genetica from "./pages/Genetica/Genetica";
import Sitio2 from "./pages/Sitio2/Sitio2";
import Sitio3 from "./pages/Sitio3/Sitio3";
import Animales from "./pages/Animales/Animales";
import AcercaDe from "./pages/AcercaDe";
import {
  saveSession,
  clearSession,
  getUserFromStorage,
  hasToken,
  UserType,
} from "./services/session";

function AppRoutes() {
  const [user, setUser] = useState<UserType | null>(getUserFromStorage());
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = getUserFromStorage();
    const authenticated = hasToken();

    if (authenticated && savedUser) {
      setUser(savedUser);
      localStorage.setItem("empresa_id", String(savedUser.empresa_id));
    } else if (!authenticated) {
      clearSession();
      setUser(null);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoginError("");

    try {
      const result = await apiLogin(email, password);
      saveSession(result.access_token, result.user);
      setUser(result.user);
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Error al iniciar sesión");
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!user && hasToken();

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginForm onLogin={handleLogin} errorMessage={loginError} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard isAuthenticated={isAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/gestacion"
          element={isAuthenticated ? <Gestacion /> : <Navigate to="/login" />}
        />
        <Route
          path="/maternidad"
          element={isAuthenticated ? <Maternidad /> : <Navigate to="/login" />}
        />
        <Route
          path="/insumos"
          element={isAuthenticated ? <Insumos /> : <Navigate to="/login" />}
        />
        <Route
          path="/granja"
          element={isAuthenticated ? <Granja /> : <Navigate to="/login" />}
        />
        <Route
          path="/economico"
          element={isAuthenticated ? <Economico /> : <Navigate to="/login" />}
        />
        <Route
          path="/reportes"
          element={isAuthenticated ? <Reportes /> : <Navigate to="/login" />}
        />
        <Route
          path="/genetica"
          element={isAuthenticated ? <Genetica /> : <Navigate to="/login" />}
        />
        <Route
          path="/sitio2"
          element={isAuthenticated ? <Sitio2 /> : <Navigate to="/login" />}
        />
        <Route
          path="/sitio3"
          element={isAuthenticated ? <Sitio3 /> : <Navigate to="/login" />}
        />
        <Route
          path="/animales"
          element={isAuthenticated ? <Animales /> : <Navigate to="/login" />}
        />
        <Route
          path="/productividad"
          element={
            isAuthenticated ? <Productividad /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/estadisticas"
          element={
            isAuthenticated ? <Estadisticas /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/usuarios"
          element={isAuthenticated ? <Usuarios /> : <Navigate to="/login" />}
        />
        <Route
          path="/acerca-de"
          element={isAuthenticated ? <AcercaDe /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
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