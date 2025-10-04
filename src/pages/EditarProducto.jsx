import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProduct,
  updateProduct,
  updateLocalProduct,
} from "../redux/productSlice";
import "../styles/EditarProducto.css";

function EditarProducto({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading, saving, error, items } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    const localProduct = items.find((p) => String(p.id) === id);
    if (localProduct) {
      dispatch(updateLocalProduct(localProduct)); // carga local
    } else {
      dispatch(fetchProduct({ id, token }));
    }
  }, [id, token, dispatch, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch(updateLocalProduct({ id: product.id, [name]: value }));
  };

  // Guardar cambios
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProduct({ id: product.id, token, product }))
      .unwrap()
      .then(() => {
        alert("Producto actualizado correctamente");
        navigate("/");
      })
      .catch(() => {});
  };

  if (loading) return <p className="loading-text">Cargando producto...</p>;
  if (!product) return <p className="error-text">No se encontró el producto</p>;

  return (
    <div className="edit-container">
      <h2 className="edit-title">Editar Producto: {product.title}</h2>
      {error && <p className="error-text">{error}</p>}

      <form className="edit-form" onSubmit={handleSubmit}>
        <label>
          Título:
          <input
            type="text"
            name="title"
            value={product.title || ""}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Categoría:
          <input
            type="text"
            name="category"
            value={product.category || ""}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción:
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Precio:
          <input
            type="number"
            name="price"
            value={product.price || 0}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Rating:
          <input
            type="number"
            step="0.1"
            name="rating"
            value={product.rating || 0}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stock:
          <input
            type="number"
            name="stock"
            value={product.stock || 0}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-buttons">
          <button type="submit" disabled={saving} className="btn-save">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarProducto;
