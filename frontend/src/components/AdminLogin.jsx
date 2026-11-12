import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials.");
        return;
      }

      if (!data.token) {
        setError("Login failed. No token received.");
        return;
      }

      localStorage.setItem("studentmartToken", data.token);
      if (data.user) {
        localStorage.setItem("studentmartUser", JSON.stringify(data.user));
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>

      <div className="auth-card">
        <div className="logo-section">
          <div className="logo" style={{ background: "linear-gradient(135deg, #059669 0%, #041d10 100%)", color: "#84cc16" }}>
            A
          </div>
          <div>
            <h1>StudentMart</h1>
            <p>Admin Portal Authentication</p>
          </div>
        </div>

        <div className="login-heading">
          <span style={{ color: "#059669", fontWeight: "800", letterSpacing: "1px" }}>ADMINISTRATOR ACCESS</span>
          <h2>Admin Sign In</h2>
          <p>Restricted access for platform administrators only.</p>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="input-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="e.g. admin@studentmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter your admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            style={{ background: "linear-gradient(135deg, #065f46 0%, #041d10 100%)", color: "#ffffff" }}
          >
            {loading ? "Authenticating Admin..." : "Sign in as Admin"}
          </button>
        </form>

        <div className="register-section">
          <span>Student user?</span>
          <Link to="/login">Student Portal Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

