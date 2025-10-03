// src/components/ModalEditar.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/ModalEditar.css"; // agrega estilos como quieras

const ModalEditar = ({ isOpen, product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    category: "",
    description: "",
    stock: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        price: product.price || 0,
        category: product.category || "",
        description: product.description || "",
        stock: product.stock || 0,
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmed = await Swal.fire({
      title: "Actualizar producto",
      text: `¿Deseas actualizar "${formData.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`https://dummyjson.com/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al actualizar producto");
      const updated = await res.json();

      Swal.fire("Actualizado", "El producto se ha actualizado correctamente", "success");
      onUpdate(updated);
      onClose();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Producto</h3>
        <form onSubmit={handleSubmit} className="modal-edit-form">
          <label>
            Título:
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </label>
          <label>
            Precio:
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </label>
          <label>
            Categoría:
            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
          </label>
          <label>
            Descripción:
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </label>
          <label>
            Stock:
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
          </label>
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-confirm">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditar;
