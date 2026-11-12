import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductGrid from "./ProductGrid";
import ProductDetails from "./ProductDetails";
import ProductForm from "./ProductForm";

function Products({ initialView = "grid" }) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { id } = useParams();

  const storedUser = localStorage.getItem("studentmartUser");
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    currentUser = null;
  }
  const isAdmin = currentUser?.role === "admin";

  // If a regular user tries to access "add", default them back to "grid"
  const safeInitial = initialView === "add" && !isAdmin ? "grid" : initialView;
  const [view, setView] = useState(id ? "details" : safeInitial);
  const [selectedProductId, setSelectedProductId] = useState(id || null);

  const handleLogout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login", { replace: true });
  };

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
          <Link to="/products" className="nav-item active">
            Products
          </Link>
          <Link to="/cart" className="nav-item">
            Cart {totalItems > 0 && <span className="nav-cart-badge">{totalItems}</span>}
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

      <main>
        {view === "grid" && (
          <ProductGrid
            onViewDetails={(prodId) => {
              setSelectedProductId(prodId);
              setView("details");
            }}
            onAddProduct={() => setView("add")}
          />
        )}

        {view === "details" && (
          <ProductDetails
            productId={selectedProductId || id}
            onBack={() => {
              setSelectedProductId(null);
              setView("grid");
            }}
          />
        )}

        {view === "add" && isAdmin && (
          <ProductForm
            onProductAdded={() => setView("grid")}
            onCancel={() => setView("grid")}
          />
        )}
      </main>
    </div>
  );
}

export default Products;
