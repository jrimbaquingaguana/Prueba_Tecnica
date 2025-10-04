import React, { useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import "../styles/CrearProducto.css";
import { addLocalProduct, createProduct } from "../redux/productSlice";

const CrearProducto = ({ isOpen, onClose, onCreate, loading }) => {
  const dispatch = useDispatch();

  // Redux: categorías disponibles
  const items = useSelector((state) => state.products.items);
  const categoriesAvailable = Array.from(
    new Set(items.map((p) => p.category).filter(Boolean))
  );

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

  // Cambios generales en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "price" || name === "stock") && Number(value) <= 0) return;

    // Si el usuario selecciona categoría existente, limpiar nueva categoría
    if (name === "category") {
      setNewCategory("");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
    setFormData({ ...formData, category: "" }); // limpia select si escribe nueva
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allImages = [...formData.images, ...files];
    setFormData({ ...formData, images: allImages });
    setPreviewImages(allImages.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newImages.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory = newCategory.trim() || formData.category;
    if (!finalCategory) {
      Swal.fire("Error", "Debes ingresar o seleccionar una categoría.", "error");
      return;
    }

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

    // Convertir imágenes a base64
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

    // Guardar localmente
    dispatch(addLocalProduct(productToSend));

    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;
      const created = await dispatch(
        createProduct({ token, product: productToSend })
      ).unwrap();

      Swal.fire(
        "¡Éxito!",
        `Producto "${created?.title || productToSend.title}" creado correctamente.`,
        "success"
      );

      if (onCreate) onCreate(created || productToSend);
    } catch (err) {
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

          {/* Select de categoría existente */}
          <label>
            Categoría existente:
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={newCategory.trim() !== ""}
            >
              <option value="">Ingresa categoría</option>
              {categoriesAvailable.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          {/* Input de nueva categoría */}
          {formData.category === "" && (
            <label>
              O nueva categoría:
              <input
                type="text"
                name="newCategory"
                placeholder="Escribe nueva categoría"
                value={newCategory}
                onChange={handleNewCategoryChange}
              />
            </label>
          )}

          <label>
            Descripción:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
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
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearProducto;
