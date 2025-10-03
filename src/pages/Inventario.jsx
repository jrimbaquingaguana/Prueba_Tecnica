// src/pages/Inventario.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaSearch, FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import "../styles/Inventario.css";
import { useDispatch, useSelector } from "react-redux";

// Componentes
import ModalEditar from "../components/ModalEditar";
import CrearProducto from "../components/CrearProducto";
import { confirmDelete } from "../components/ModalEliminar";

// Redux
import { 
  fetchProducts,
  removeProduct,
  updateLocalProduct,
  setSearch,
  setSort,
  setPage,
} from "../redux/productSlice";

const ActionButton = ({ type, onClick, icon }) => (
  <button className={`btn-${type}`} onClick={onClick} title={type}>
    {icon}
  </button>
);

function Inventario() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const dispatch = useDispatch();

  // Redux state
  const { items, loading, error, searchTerm, sortConfig, page, limit } = useSelector(
    (state) => state.products
  );
  
  // Token desde localStorage
  const token = JSON.parse(localStorage.getItem("auth"))?.token;

  // Modal edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Modal crear
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Cargar productos al inicio
  useEffect(() => {
    if (token) {
      dispatch(fetchProducts(token));
    }
  }, [dispatch, token]);

  // Navegar a detalle de producto
  const handleView = (id) => navigate(`/producto/${id}`);

  // Editar producto
  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct) => {
    dispatch(updateLocalProduct(updatedProduct));
  };

  // Eliminar producto
  const handleDeleteClick = async (product) => {
    await confirmDelete(product, async () => {
      try {
        const res = await fetch(`https://dummyjson.com/products/${product.id}`, {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("No se pudo eliminar el producto");

        // Actualizamos Redux
        dispatch(removeProduct(product.id));
      } catch (err) {
        throw err;
      }
    });
  };

  // Crear producto
  const handleCreateProduct = async (newProduct) => {
    try {
      setCreating(true);
      const res = await fetch("https://dummyjson.com/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error("Error al crear producto");
      await res.json();

      // Actualizamos lista
      dispatch(fetchProducts(token));
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Filtrado y ordenamiento
  const filteredAndSorted = useMemo(() => {
    let filtered = items.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (["price", "rating", "stock"].includes(sortConfig.key)) {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = (valA || "").toString().toLowerCase();
          valB = (valB || "").toString().toLowerCase();
        }

        if (typeof valA === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
      });
    }

    return filtered;
  }, [items, searchTerm, sortConfig]);

  const totalPages = Math.max(Math.ceil(filteredAndSorted.length / limit), 1);
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />;
  };

  return (
    <div className="inventory-container" ref={containerRef}>
      <h2>Inventario de Productos</h2>

      <div className="search-create-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
        </div>
        <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus /> Crear Producto
        </button>
      </div>

      {loading ? (
        <div className="loading-inventory">
          <img src="https://i.gifer.com/ZZ5H.gif" alt="Cargando" className="loader-gif" />
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : items.length === 0 ? (
        <p className="no-results">No hay productos en el inventario.</p>
      ) : (
        <>
          {paginatedProducts.length === 0 ? (
            <p className="no-results">No se ha encontrado el producto</p>
          ) : (
            <>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th onClick={() => dispatch(setSort({ key: "title", direction: sortConfig.direction === "asc" ? "desc" : "asc" }))} className="sortable">
                      Título {getSortIcon("title")}
                    </th>
                    <th onClick={() => dispatch(setSort({ key: "category", direction: sortConfig.direction === "asc" ? "desc" : "asc" }))} className="sortable">
                      Categoría {getSortIcon("category")}
                    </th>
                    <th onClick={() => dispatch(setSort({ key: "price", direction: sortConfig.direction === "asc" ? "desc" : "asc" }))} className="sortable">
                      Precio {getSortIcon("price")}
                    </th>
                    <th onClick={() => dispatch(setSort({ key: "rating", direction: sortConfig.direction === "asc" ? "desc" : "asc" }))} className="sortable">
                      Rating {getSortIcon("rating")}
                    </th>
                    <th onClick={() => dispatch(setSort({ key: "stock", direction: sortConfig.direction === "asc" ? "desc" : "asc" }))} className="sortable">
                      Stock {getSortIcon("stock")}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <img src={prod.thumbnail} alt={prod.title} className="product-image" />
                      </td>
                      <td>{prod.title}</td>
                      <td>{prod.category}</td>
                      <td>${prod.price}</td>
                      <td>{prod.rating}</td>
                      <td>{prod.stock}</td>
                      <td className="action-buttons">
                        <ActionButton type="details" onClick={() => handleView(prod.id)} icon={<FaSearch />} />
                        <ActionButton type="edit" onClick={() => handleEditClick(prod)} icon={<FaEdit />} />
                        <ActionButton type="delete" onClick={() => handleDeleteClick(prod)} icon={<FaTrash />} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button onClick={() => dispatch(setPage(currentPage - 1))} disabled={currentPage === 1}>
                  ← Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button onClick={() => dispatch(setPage(currentPage + 1))} disabled={currentPage === totalPages}>
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </>
      )}

      <ModalEditar
        isOpen={isEditModalOpen}
        product={productToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateProduct}
      />

      <CrearProducto
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProduct}
        loading={creating}
      />
    </div>
  );
}

export default Inventario;
