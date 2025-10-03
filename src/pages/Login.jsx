import React, { useState } from "react";
import "../styles/App.css";
import loginHeader from "../assets/login.webp";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  // Recuperamos directamente de localStorage sin estado
  const storedUser = JSON.parse(localStorage.getItem("auth"))?.user;

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <img src={loginHeader} alt="Login header" className="login-pic" />
        <h2>Iniciar Sesión</h2>

        {storedUser && (
          <div className="user-info">
            <img
              src={storedUser.image}
              alt={storedUser.username}
              className="user-photo"
            />
            <span>{storedUser.firstName}</span>
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} className="btn-login">
          {loading ? "Cargando..." : "Entrar"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
