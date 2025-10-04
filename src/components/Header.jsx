import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { FaSignOutAlt } from "react-icons/fa"; 
import "../styles/Header.css";

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) return null; 

  return (
    <header className="header">
      <h1 className="header-title">Inventario</h1>
      <div className="user-info">
        <span className="username">{user.username}</span>
        <img
          src={user.image || "https://via.placeholder.com/40"}
          alt="Perfil"
          className="profile-pic"
        />
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
