import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrash, FaEdit, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, removeProduct } from "../redux/productSlice";
import "../styles/Inventario.css";

const ActionButton = ({ type, onClick, icon }) => (
  <button className={`btn-${type}`} onClick={onClick} title={type}>
    {icon}
  </button>
);

function Inventario() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  const { items: products, loading, error } = useSelector((state) => state.products);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const limit = 10;

  // Token desde localStorage
  const storedAuth = JSON.parse(localStorage.getItem("auth"));
  const token = storedAuth?.token;

  useEffect(() => {
    if (token) {
      dispatch(fetchProducts(token));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, token]);

  // Intersection Observer para animaciones al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animar solo una vez
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
  }, [products, page, searchTerm]);

  const handleView = (id) => navigate(`/producto/${id}`);
  const handleEdit = (id) => navigate(`/editar-producto/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`https://dummyjson.com/products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al eliminar producto");
      alert("Producto eliminado correctamente");
      dispatch(removeProduct(id));
    } catch (err) {
      alert(err.message);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === "string")
          return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      });
    }
    return filtered;
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSorted.length / limit);
  const paginatedProducts = filteredAndSorted.slice((page - 1) * limit, page * limit);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />;
  };

  return (
    <div className="inventory-container" ref={containerRef}>
      <h2 className="fade-in-scroll">Inventario de Productos</h2>

      {loading ? (
        <div className="loading-inventory fade-in-scroll">
          <img src="https://i.gifer.com/ZZ5H.gif" alt="Cargando" style={{ width: "80px", marginTop: "20px" }} />
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <p className="error fade-in-scroll">{error}</p>
      ) : products.length === 0 ? (
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

          {filteredAndSorted.length === 0 ? (
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
                        <ActionButton type="delete" onClick={() => handleDelete(prod.id)} icon={<FaTrash />} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination fade-in-scroll">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                  ← Anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
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
