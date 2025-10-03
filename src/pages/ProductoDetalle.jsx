import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import "../styles/ProductoDetalle.css";

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reduxToken = useSelector((state) => state.auth.token);
  const [token, setToken] = useState(reduxToken || localStorage.getItem("token") || "");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const headers = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const res = await fetch(`https://dummyjson.com/products/${id}`, { headers });
        if (!res.ok) throw new Error("Error al cargar el producto");
        const data = await res.json();
        setProduct(data);

        const relatedRes = await fetch(
          `https://dummyjson.com/products/category/${encodeURIComponent(data.category)}?limit=6`,
          { headers }
        );
        if (!relatedRes.ok) throw new Error("Error al cargar productos relacionados");
        const relatedData = await relatedRes.json();
        setRelatedProducts(relatedData.products.filter((p) => p.id !== data.id));
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  if (!token) return (
    <p style={{ textAlign: "center", marginTop: "50px", color: "#e74c3c" }}>
      No estás autorizado para ver este producto. Por favor inicia sesión.
    </p>
  );

  if (loading) return (
    <div className="loading-inventory">
      <img src="https://i.gifer.com/ZZ5H.gif" alt="Cargando" className="loader-gif" />
      <p>Cargando producto...</p>
    </div>
  );

  if (!product) return <p>No se encontró el producto</p>;

  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const prevImage = () =>
    setMainImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setMainImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="inventory-container">
      <button className="volver-btn" onClick={() => navigate(-1)}>← Volver</button>
      <h2 className="product-title">{product.title}</h2>

      <div className="product-main">
        <div className="main-image-container">
          <img src={images[mainImageIndex]} alt={product.title} className="main-image" />

          {/* Flechas modernas dentro de la imagen */}
          {images.length > 1 && (
            <>
              <button className="image-arrow left" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              <button className="image-arrow right" onClick={nextImage}>
                <FaChevronRight />
              </button>

              {/* Número de índice */}
              <div className="carousel-index-overlay">
                {mainImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        <div className="product-details">
          <p><strong>Categoría:</strong> {product.category}</p>
          <p><strong>Descripción:</strong> {product.description}</p>
          <p><strong>Precio:</strong> ${product.price}</p>
          <p><strong>Rating:</strong> {product.rating}</p>
          <p><strong>Stock disponible:</strong> {product.stock}</p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.title}-${index}`}
              className={`thumbnail ${mainImageIndex === index ? "active" : ""}`}
              onClick={() => setMainImageIndex(index)}
            />
          ))}
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h3>Productos relacionados</h3>
          <div className="related-carousel">
            {relatedProducts.map((p) => (
              <div key={p.id} className="related-card" onClick={() => navigate(`/producto/${p.id}`)}>
                <img src={p.thumbnail} alt={p.title} className="related-image" />
                <p className="related-title">{p.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductoDetalle;
