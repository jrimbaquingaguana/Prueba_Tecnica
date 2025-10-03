// src/Inventario.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash, FaEdit, FaArrowUp, FaArrowDown } from "react-icons/fa";
import "../styles/Inventario.css";
import { confirmDelete } from "../components/Modal_eliminar";

const ActionButton = ({ type, onClick, icon }) => (
  <button className={`btn-${type}`} onClick={onClick} title={type}>
    {icon}
  </button>
);

function Inventario() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const limit = 10;

  const storedAuth = JSON.parse(localStorage.getItem("auth"));
  const token = storedAuth?.token;

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://dummyjson.com/products?limit=100`, { headers });
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();

        const products = data.products.map((p) => ({
          ...p,
          price: Number(p.price ?? 0),
          rating: Number(p.rating ?? 0),
          stock: Number(p.stock ?? 0),
          title: p.title ?? "",
          category: p.category ?? "",
        }));

        setItems(products);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [token]);

  // Animaciones al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".fade-in-scroll");
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [items, page, searchTerm]);

  const handleView = (id) => navigate(`/producto/${id}`);
  const handleEdit = (id) => navigate(`/editar-producto/${id}`);

  // Eliminar producto usando SweetAlert2
  const handleDeleteClick = async (product) => {
    await confirmDelete(product, async () => {
      try {
        const res = await fetch(`https://dummyjson.com/products/${product.id}`, {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Error al eliminar producto");

        setItems((prev) => prev.filter((p) => p.id !== product.id));
      } catch (err) {
        alert(err.message);
      }
    });
  };

  // Ordenamiento
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
    setPage(0);
    setTimeout(() => setPage(1), 0);
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
      <h2 className="fade-in-scroll">Inventario de Productos</h2>

      {loading ? (
        <div className="loading-inventory fade-in-scroll">
          <img src="https://i.gifer.com/ZZ5H.gif" alt="Cargando" className="loader-gif" />
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <p className="error fade-in-scroll">{error}</p>
      ) : items.length === 0 ? (
        <p className="no-results fade-in-scroll">No hay productos en el inventario.</p>
      ) : (
        <>
          <div className="search-container fade-in-scroll">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {paginatedProducts.length === 0 ? (
            <p className="no-results fade-in-scroll">No se ha encontrado el producto</p>
          ) : (
            <>
              <table className="inventory-table fade-in-scroll">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th onClick={() => requestSort("title")} className="sortable">
                      Título {getSortIcon("title")}
                    </th>
                    <th onClick={() => requestSort("category")} className="sortable">
                      Categoría {getSortIcon("category")}
                    </th>
                    <th onClick={() => requestSort("price")} className="sortable">
                      Precio {getSortIcon("price")}
                    </th>
                    <th onClick={() => requestSort("rating")} className="sortable">
                      Rating {getSortIcon("rating")}
                    </th>
                    <th onClick={() => requestSort("stock")} className="sortable">
                      Stock {getSortIcon("stock")}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((prod) => (
                    <tr key={prod.id} className="fade-in-scroll">
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
                        <ActionButton type="edit" onClick={() => handleEdit(prod.id)} icon={<FaEdit />} />
                        <ActionButton type="delete" onClick={() => handleDeleteClick(prod)} icon={<FaTrash />} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination fade-in-scroll">
                <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                  ← Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Inventario;
