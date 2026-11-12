import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useCart } from "../context/CartContext";
import "../styles/ProductGrid.css";

const API = `${API_BASE_URL}/products`;

function ProductGrid({ onViewDetails, onAddProduct }) {
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const handleViewDetails = onViewDetails || ((id) => navigate(`/products/${id}`));
    const handleAddProduct = onAddProduct || (() => navigate("/products/add"));

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState("");

    const handleAddToCart = async (product) => {
        setActionMsg("");
        const res = await addToCart(product._id, 1);
        if (res.success) {
            setActionMsg(`Added "${product.name}" to cart!`);
            setTimeout(() => setActionMsg(""), 3000);
        } else {
            setActionMsg(res.message);
            setTimeout(() => setActionMsg(""), 4000);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setMessage("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) params.set("search", search.trim());
            if (category !== "All") params.set("category", category);
            if (sort) params.set("sort", sort);

            const response = await fetch(`${API}?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load products");
            }

            setProducts(data);
        } catch (error) {
            setMessage(error.message || "Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category, sort]);

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category))
    ];

    const storedUser = localStorage.getItem("studentmartUser");
    let currentUser = null;
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        currentUser = null;
    }
    const isAdmin = currentUser?.role === "admin";

    return (
        <section className="products-page">
            <div className="products-heading">
                <div>
                    <h1>Explore Products</h1>
                    <p>Find what you need for student life.</p>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        className="products-add-btn"
                        onClick={handleAddProduct}
                    >
                        + Add Product
                    </button>
                )}
            </div>

            <div className="product-controls">
                <input
                    type="search"
                    placeholder="Search products by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search products"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Filter by category"
                >
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item === "All" ? "All Categories" : item}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort by price"
                >
                    <option value="">Default Order</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </div>

            {actionMsg && <div className="products-message" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>{actionMsg}</div>}
            {message && <p className="products-message">{message}</p>}

            {loading ? (
                <p className="products-status">Loading products...</p>
            ) : products.length === 0 ? (
                <div className="products-empty">
                    <h3>No products found</h3>
                    <p>Try another search or add a new product.</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => {
                        const isOutOfStock = Number(product.stock) <= 0;
                        const sellerDisplay = product.seller?.name || product.sellerName || "StudentMart Seller";

                        return (
                            <article className="product-card" key={product._id}>
                                {product.image ? (
                                    <img
                                        className="product-image"
                                        src={product.image}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="product-image-placeholder">
                                        No image available
                                    </div>
                                )}

                                <div className="product-card-content">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span className="product-category">
                                            {product.category}
                                        </span>
                                        {isOutOfStock ? (
                                            <span className="stock-badge out-of-stock">
                                                Out of Stock
                                            </span>
                                        ) : (
                                            <span className="stock-badge in-stock">
                                                In Stock ({product.stock})
                                            </span>
                                        )}
                                    </div>

                                    <h3>{product.name}</h3>

                                    <p className="product-seller-tag">
                                        Seller: <span>{sellerDisplay}</span>
                                    </p>

                                    <p className="product-description">
                                        {product.description}
                                    </p>

                                    <div className="product-card-footer">
                                        <strong>
                                            ₹{Number(product.price).toFixed(2)}
                                        </strong>

                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleViewDetails(product._id)}
                                            >
                                                Details
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-add-cart"
                                                disabled={isOutOfStock || cartLoading}
                                                onClick={() => handleAddToCart(product)}
                                                title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                            >
                                                {isOutOfStock ? "Unavailable" : "+ Cart"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProductGrid;
