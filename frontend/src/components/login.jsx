import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password."
        );
        return;
      }

      if (!data.token) {
        setError(
          "Login failed. Authentication token was not received."
        );
        return;
      }

      // Store token
      localStorage.setItem(
        "studentmartToken",
        data.token
      );

      // Store user
      if (data.user) {
        localStorage.setItem(
          "studentmartUser",
          JSON.stringify(data.user)
        );
      }

      // Direct dashboard
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
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

          <div className="logo">
            S
          </div>

          <div>
            <h1>StudentMart</h1>
            <p>
              Student Profile Management
            </p>
          </div>

        </div>

        <div className="login-heading">

          <span>WELCOME BACK</span>

          <h2>
            Sign in to your account
          </h2>

          <p>
            Enter your credentials to continue.
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
            />

          </div>

          <div className="input-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />

          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>

        </form>

        <div className="register-section">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;