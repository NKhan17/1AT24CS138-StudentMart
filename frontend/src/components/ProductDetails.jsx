import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetails.css";

const API = `${API_BASE_URL}/products`;

function ProductDetails({ productId, onBack }) {
    const params = useParams();
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const effectiveId = productId || params.id;
    const handleBack = onBack || (() => navigate("/products"));

    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("");
    const [cartMsg, setCartMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const handleAddToCart = async () => {
        setCartMsg("");
        const res = await addToCart(product._id, 1);
        if (res.success) {
            setCartMsg("Added to cart successfully!");
            setTimeout(() => setCartMsg(""), 3000);
        } else {
            setCartMsg(res.message);
            setTimeout(() => setCartMsg(""), 4000);
        }
    };

    useEffect(() => {
        if (!effectiveId) {
            setLoading(false);
            setMessage("No product selected");
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setMessage("");

            try {
                const response = await fetch(`${API}/${effectiveId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load product");
                }

                setProduct(data);
            } catch (error) {
                setMessage(error.message || "Unable to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [effectiveId]);

    if (loading) {
        return <p className="product-details-status">Loading product...</p>;
    }

    if (!product) {
        return (
            <section className="product-details-page">
                <p>{message || "Product not found"}</p>
                <button className="product-back-button" onClick={handleBack}>
                    ← Back to Products
                </button>
            </section>
        );
    }

    const isOutOfStock = Number(product.stock) <= 0;
    const sellerName = product.seller?.name || product.sellerName || "StudentMart Seller";
    const sellerEmail = product.seller?.email || product.sellerEmail || "";

    return (
        <section className="product-details-page">
            <button className="product-back-button" onClick={handleBack}>
                ← Back to Products
            </button>

            {cartMsg && (
                <div style={{ padding: "12px 18px", borderRadius: "10px", margin: "16px 0", background: cartMsg.includes("successfully") ? "#ecfdf5" : "#fef2f2", color: cartMsg.includes("successfully") ? "#065f46" : "#dc2626", border: "1px solid #a7f3d0" }}>
                    {cartMsg}
                </div>
            )}

            <div className="product-details-card">
                {product.image ? (
                    <img src={product.image} alt={product.name} />
                ) : (
                    <div className="product-details-placeholder">
                        No image available
                    </div>
                )}

                <div className="product-details-content">
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
                                In Stock
                            </span>
                        )}
                    </div>

                    <h1>{product.name}</h1>

                    <p className="product-seller-tag" style={{ fontSize: "14px" }}>
                        Seller: <strong>{sellerName}</strong> {sellerEmail && `(${sellerEmail})`}
                    </p>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <p className="product-details-price">
                        ₹{Number(product.price).toFixed(2)}
                    </p>

                    <p>
                        <strong>Available stock:</strong>{" "}
                        {isOutOfStock ? (
                            <span style={{ color: "#dc2626", fontWeight: "bold" }}>0 (Unavailable)</span>
                        ) : (
                            <span>{product.stock} units</span>
                        )}
                    </p>

                    <div style={{ marginTop: "24px" }}>
                        <button
                            type="button"
                            className="btn-add-cart"
                            style={{ padding: "12px 28px", fontSize: "15px" }}
                            disabled={isOutOfStock || cartLoading}
                            onClick={handleAddToCart}
                        >
                            {isOutOfStock ? "Out of Stock" : "Add to Shopping Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductDetails;
