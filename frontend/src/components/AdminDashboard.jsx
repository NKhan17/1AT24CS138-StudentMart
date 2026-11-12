import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import ProductForm from "./ProductForm";

function AdminDashboard() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [view, setView] = useState("table"); // "table", "add", "edit"
    const [productToEdit, setProductToEdit] = useState(null);

    const token = localStorage.getItem("studentmartToken");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            } else {
                setMessage(data.message || "Failed to load products");
            }
        } catch (err) {
            setMessage("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("studentmartToken");
        localStorage.removeItem("studentmartUser");
        navigate("/admin/login", { replace: true });
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove "${name}"?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Product "${name}" deleted successfully.`);
                fetchProducts();
            } else {
                alert(data.message || "Failed to delete product");
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };

    const handleQuickStockUpdate = async (id, newStock) => {
        const stockVal = Number(newStock);
        if (!Number.isInteger(stockVal) || stockVal < 0) {
            alert("Stock must be a non-negative whole number.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ stock: stockVal })
            });

            if (res.ok) {
                fetchProducts();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update stock");
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };

    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const outOfStockCount = products.filter((p) => Number(p.stock) <= 0).length;

    return (
        <div className="dashboard-page">
            <nav className="top-navbar">
                <div className="nav-brand">
                    <div className="nav-logo" style={{ background: "linear-gradient(135deg, #059669 0%, #041d10 100%)", color: "#84cc16" }}>
                        A
                    </div>
                    <div>
                        <h2>StudentMart</h2>
                        <span style={{ color: "#34d399" }}>Admin Control Panel</span>
                    </div>
                </div>

                <div className="nav-links">
                    <Link to="/admin" className="nav-item active">
                        Product Management
                    </Link>
                    <Link to="/dashboard" className="nav-item">
                        Student View
                    </Link>
                    <button className="nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="admin-page">
                {view === "table" && (
                    <>
                        <div className="admin-header">
                            <div>
                                <span className="dashboard-label">ADMINISTRATOR PORTAL</span>
                                <h1>Product Inventory & Management</h1>
                                <p>Add, update, manage stock availability, and remove catalog items.</p>
                            </div>

                            <button
                                type="button"
                                className="dashboard-action"
                                style={{ margin: 0 }}
                                onClick={() => {
                                    setProductToEdit(null);
                                    setView("add");
                                }}
                            >
                                + Add New Product
                            </button>
                        </div>

                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <span>TOTAL PRODUCTS</span>
                                <h3>{products.length}</h3>
                            </div>
                            <div className="admin-stat-card">
                                <span>TOTAL STOCK UNITS</span>
                                <h3>{totalStock}</h3>
                            </div>
                            <div className="admin-stat-card">
                                <span>OUT OF STOCK ITEMS</span>
                                <h3 style={{ color: outOfStockCount > 0 ? "#dc2626" : "#052112" }}>
                                    {outOfStockCount}
                                </h3>
                            </div>
                        </div>

                        {message && (
                            <div className="products-message" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                                {message}
                            </div>
                        )}

                        <div className="admin-table-container">
                            <div className="admin-table-header">
                                <h2>All Listed Products</h2>
                                <span>Showing {products.length} entries</span>
                            </div>

                            {loading ? (
                                <p>Loading products...</p>
                            ) : products.length === 0 ? (
                                <p>No products in platform catalog.</p>
                            ) : (
                                <table className="admin-products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock / Status</th>
                                            <th>Quick Stock Edit</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => {
                                            const isOut = Number(product.stock) <= 0;
                                            return (
                                                <tr key={product._id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="admin-table-img"
                                                                />
                                                            ) : (
                                                                <div className="admin-table-placeholder">No img</div>
                                                            )}
                                                            <div>
                                                                <strong>{product.name}</strong>
                                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                                    ID: {product._id.slice(-6)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{product.category}</td>
                                                    <td>
                                                        <strong>₹{Number(product.price).toFixed(2)}</strong>
                                                    </td>
                                                    <td>
                                                        {isOut ? (
                                                            <span className="stock-badge out-of-stock">
                                                                Out of Stock
                                                            </span>
                                                        ) : (
                                                            <span className="stock-badge in-stock">
                                                                {product.stock} Available
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                defaultValue={product.stock}
                                                                className="admin-stock-input"
                                                                onBlur={(e) => {
                                                                    if (Number(e.target.value) !== product.stock) {
                                                                        handleQuickStockUpdate(product._id, e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                            <span style={{ fontSize: "11px", color: "#64748b" }}>units</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="admin-actions">
                                                            <button
                                                                type="button"
                                                                className="btn-admin-edit"
                                                                onClick={() => {
                                                                    setProductToEdit(product);
                                                                    setView("edit");
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-admin-delete"
                                                                onClick={() => handleDeleteProduct(product._id, product.name)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {view === "add" && (
                    <ProductForm
                        onProductAdded={() => {
                            setView("table");
                            fetchProducts();
                            setMessage("New product added successfully.");
                        }}
                        onCancel={() => setView("table")}
                    />
                )}

                {view === "edit" && (
                    <ProductForm
                        productToEdit={productToEdit}
                        onProductAdded={() => {
                            setView("table");
                            fetchProducts();
                            setMessage("Product updated successfully.");
                        }}
                        onCancel={() => {
                            setProductToEdit(null);
                            setView("table");
                        }}
                    />
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;

