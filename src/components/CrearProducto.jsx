import React, { useState } from "react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import "../styles/CrearProducto.css";

// Redux
import { createProduct, addLocalProduct } from "../redux/productSlice";

const CrearProducto = ({ isOpen, onClose, onCreate }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    price: 1,
    category: "",
    description: "",
    stock: 1,
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" && Number(value) <= 0) return;
    if (name === "stock" && Number(value) <= 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allImages = [...formData.images, ...files];
    setFormData({ ...formData, images: allImages });
    const previews = allImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newImages.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire("Error", "El título es obligatorio.", "error");
      return;
    }
    if (Number(formData.price) <= 0) {
      Swal.fire("Error", "El precio debe ser mayor a 0.", "error");
      return;
    }
    if (Number(formData.stock) <= 0) {
      Swal.fire("Error", "El stock debe ser mayor a 0.", "error");
      return;
    }

    const finalCategory =
      newCategory.trim() !== "" ? newCategory.trim() : formData.category;
    if (!finalCategory) {
      Swal.fire(
        "Error",
        "Debes seleccionar o ingresar una categoría.",
        "error"
      );
      return;
    }

    const imageUrls = await Promise.all(
      formData.images.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );

    const productToSend = {
      ...formData,
      category: finalCategory,
      images: imageUrls,
    };

    // Guardar siempre localmente primero
    dispatch(addLocalProduct(productToSend));

    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;

      // Intentar crear en la API
      const created = await dispatch(
        createProduct({ token, product: productToSend })
      ).unwrap();

      // Usar title del API o fallback al local
      const productTitle = created?.title || productToSend.title;

      Swal.fire(
        "¡Éxito!",
        `Producto "${productTitle}" creado correctamente.`,
        "success"
      );

      if (onCreate) onCreate(created || productToSend);

    } catch (err) {
      // Si falla la API, ya está guardado localmente
      Swal.fire(
        "Atención",
        `Producto "${productToSend.title}" guardado localmente.`,
        "warning"
      );
      if (onCreate) onCreate(productToSend);
    }

    // Limpiar formulario
    setFormData({
      title: "",
      price: 1,
      category: "",
      description: "",
      stock: 1,
      images: [],
    });
    setPreviewImages([]);
    setNewCategory("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear Producto</h3>
        <form onSubmit={handleSubmit} className="modal-create-form">
          <label>
            Título:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Precio:
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min={1}
              required
            />
          </label>

          <label>
            Stock:
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min={1}
              required
            />
          </label>

          <label>
            Categoría:
            <input
              type="text"
              name="category"
              placeholder="Categoría"
              value={formData.category || newCategory}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                setNewCategory("");
              }}
            />
          </label>

          <label>
            Descripción:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </label>

          <label>
            Imágenes:
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {previewImages.length > 0 && (
            <div className="preview-images">
              {previewImages.map((src, idx) => (
                <div key={idx} className="preview-container">
                  <img src={src} alt={`preview-${idx}`} className="preview-img" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearProducto;
