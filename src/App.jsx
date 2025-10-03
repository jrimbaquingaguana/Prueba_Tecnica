import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  logout,
  loadStoredAuth,
  hideWelcome,
} from "./redux/authSlice";

import "./styles/App.css";
import Inventario from "../src/pages/Inventario.jsx";
import Header from "../src/pages/Header.jsx"; 
import ProductoDetalle from "../src/pages/ProductoDetalle.jsx";
import Login from "../src/pages/Login.jsx";
import EditarProducto from "../src/pages/EditarProducto.jsx";

// RUTA PROTEGIDA
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" />;
};

function App() {
  const dispatch = useDispatch();
  const { user, token, loading, error, showWelcome } = useSelector(
    (state) => state.auth
  );
  const welcomeTimeout = useRef(null);

  // ✅ Cargar datos guardados en localStorage
  useEffect(() => {
    dispatch(loadStoredAuth());
    return () => clearTimeout(welcomeTimeout.current);
  }, [dispatch]);

  // ✅ Ocultar mensaje de bienvenida después de 1.5s
  useEffect(() => {
    if (showWelcome) {
      welcomeTimeout.current = setTimeout(() => {
        dispatch(hideWelcome());
      }, 1500);
    }
  }, [showWelcome, dispatch]);

  // ✅ LOGIN
  const handleLogin = (e, username, password) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    dispatch(logout());
    clearTimeout(welcomeTimeout.current);
  };

  // ✅ Mostrar Login si no hay usuario
  if (!user) {
    return (
      <Login handleLogin={handleLogin} loading={loading} error={error} />
    );
  }

  // ✅ APP PRINCIPAL
  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />

      {showWelcome ? (
        <div className="welcome-container">
          <h2>
            ¡Bienvenido, {user.firstName} {user.lastName}!
          </h2>
          <p>Cargando inventario...</p>
          <img
            src="https://i.gifer.com/ZZ5H.gif"
            alt="Cargando"
            className="loader-gif"
          />
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Inventario token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/producto/:id"
            element={
              <ProtectedRoute user={user}>
                <ProductoDetalle token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar-producto/:id"
            element={
              <ProtectedRoute user={user}>
                <EditarProducto token={token} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
