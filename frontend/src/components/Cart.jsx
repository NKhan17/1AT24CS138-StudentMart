import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, clearCart, loading } = useCart();
    const items = cart?.items || [];

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => {
            const price = item.product ? Number(item.product.price) || 0 : 0;
            return sum + price * item.quantity;
        }, 0);
    };

    const subtotal = calculateSubtotal();

    const handleLogout = () => {
        localStorage.removeItem("studentmartToken");
        localStorage.removeItem("studentmartUser");
        navigate("/login", { replace: true });
    };

    const storedUser = localStorage.getItem("studentmartUser");
    let currentUser = null;
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        currentUser = null;
    }
    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="dashboard-page">
            <nav className="top-navbar">
                <div className="nav-brand">
                    <div className="nav-logo">S</div>
                    <div>
                        <h2>StudentMart</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <div className="nav-links">
                    <Link to="/dashboard" className="nav-item">
                        Dashboard
                    </Link>
                    <Link to="/products" className="nav-item">
                        Products
                    </Link>
                    <Link to="/cart" className="nav-item active">
                        Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
                    </Link>
                    {isAdmin && (
                        <Link to="/admin" className="nav-item">
                            Admin
                        </Link>
                    )}
                    <Link to="/profile" className="nav-item">
                        Profile
                    </Link>
                    <button className="nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="cart-page">
                <div className="cart-header">
                    <div>
                        <h1>Shopping Cart</h1>
                        <p>Review items in your cart and proceed to checkout.</p>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            className="clear-cart-btn"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <h3>Your cart is empty</h3>
                        <p>Explore products from student peers and add them to your cart.</p>
                        <Link to="/products" className="dashboard-action">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="cart-container">
                        <div className="cart-items-list">
                            {items.map((item) => {
                                const product = item.product;
                                if (!product) return null;

                                const isOutOfStock = Number(product.stock) <= 0;
                                const sellerName = product.seller?.name || product.sellerName || "StudentMart Seller";
                                const sellerEmail = product.seller?.email || product.sellerEmail || "";

                                return (
                                    <div className="cart-item-card" key={product._id || item._id}>
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="cart-item-image"
                                            />
                                        ) : (
                                            <div className="cart-item-placeholder">
                                                No image
                                            </div>
                                        )}

                                        <div className="cart-item-details">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span className="cart-item-category">
                                                    {product.category}
                                                </span>
                                                {isOutOfStock ? (
                                                    <span className="stock-badge out-of-stock">
                                                        Out of Stock
                                                    </span>
                                                ) : (
                                                    <span className="stock-badge in-stock">
                                                        {product.stock} in stock
                                                    </span>
                                                )}
                                            </div>

                                            <h3>{product.name}</h3>

                                            <p className="cart-item-seller">
                                                Sold by: <strong>{sellerName}</strong>
                                                {sellerEmail ? ` (${sellerEmail})` : ""}
                                            </p>

                                            <div className="cart-item-price">
                                                ₹{Number(product.price).toFixed(2)} each
                                            </div>

                                            <div className="cart-item-actions">
                                                <div className="cart-qty-controls">
                                                    <button
                                                        type="button"
                                                        className="cart-qty-btn"
                                                        disabled={item.quantity <= 1 || loading}
                                                        onClick={() =>
                                                            updateQuantity(product._id, item.quantity - 1)
                                                        }
                                                    >
                                                        -
                                                    </button>
                                                    <span className="cart-qty-value">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="cart-qty-btn"
                                                        disabled={item.quantity >= product.stock || isOutOfStock || loading}
                                                        onClick={() =>
                                                            updateQuantity(product._id, item.quantity + 1)
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="cart-remove-btn"
                                                    onClick={() => removeFromCart(product._id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary-card">
                            <h2>Order Summary</h2>
                            <div className="summary-row">
                                <span>Total Items:</span>
                                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery / Campus Pickup:</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <button
                                type="button"
                                className="checkout-btn"
                                onClick={() => alert("Checkout functionality ready! Order placed.")}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Cart;

