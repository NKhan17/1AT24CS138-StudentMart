import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token =
        localStorage.getItem(
          "studentmartToken"
        );

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/auth/profile",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem(
            "studentmartToken"
          );

          localStorage.removeItem(
            "studentmartUser"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setUser(data.user);

        localStorage.setItem(
          "studentmartUser",
          JSON.stringify(data.user)
        );
      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(
      "studentmartToken"
    );

    localStorage.removeItem(
      "studentmartUser"
    );

    navigate("/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-box">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          TOP NAVIGATION
          ========================= */}

      <nav className="top-navbar">

        <div className="nav-brand">

          <div className="nav-logo">
            S
          </div>

          <div>
            <h2>StudentMart</h2>

            <span>
              Student Portal
            </span>
          </div>

        </div>

        <div className="nav-links">

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="nav-item"
          >
            Profile
          </Link>

          <button
            className="nav-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =========================
          DASHBOARD
          ========================= */}

      <main className="dashboard-main">

        {/* Welcome */}
        <section className="dashboard-header">

          <div>

            <span className="dashboard-label">
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome back!
            </h1>

            <p>
              Manage your student account
              from one place.
            </p>

          </div>

          {/* Profile corner card */}
          <Link
            to="/profile"
            className="profile-corner"
          >

            <div className="profile-avatar">
              {user?.usn
                ? user.usn
                    .charAt(0)
                    .toUpperCase()
                : "S"}
            </div>

            <div className="profile-corner-info">

              <strong>
                {user?.usn || "Student"}
              </strong>

              <span>
                Edit Profile
              </span>

            </div>

            <div className="profile-arrow">
              →
            </div>

          </Link>

        </section>

        {/* =========================
            MAIN CONTENT
            ========================= */}

        <section className="dashboard-content-area">

          {/* Main welcome card */}
          <div className="main-dashboard-card">

            <span className="dashboard-label">
              STUDENTMART
            </span>

            <h2>
              Your student account
            </h2>

            <p>
              Your profile is successfully
              connected to StudentMart.
              You can manage your account
              information from the profile
              section.
            </p>

            <Link
              to="/profile"
              className="dashboard-action"
            >
              Edit Profile
            </Link>

          </div>

          {/* Account cards */}
          <div className="dashboard-info-grid">

            <div className="info-card">

              <span>
                USN
              </span>

              <h3>
                {user?.usn || "-"}
              </h3>

              <p>
                Student identification number
              </p>

            </div>

            <div className="info-card">

              <span>
                EMAIL
              </span>

              <h3 className="email-value">
                {user?.email || "-"}
              </h3>

              <p>
                Registered email address
              </p>

            </div>

            <div className="info-card">

              <span>
                ACCOUNT
              </span>

              <h3>
                Active
              </h3>

              <p>
                Your account is active
              </p>

            </div>

          </div>

        </section>

        {/* Account overview */}
        <section className="account-overview">

          <div className="overview-heading">

            <div>

              <span className="dashboard-label">
                ACCOUNT OVERVIEW
              </span>

              <h2>
                Profile details
              </h2>

            </div>

            <Link
              to="/profile"
              className="overview-edit"
            >
              Edit
            </Link>

          </div>

          <div className="overview-grid">

            <div>
              <span>
                USN
              </span>

              <strong>
                {user?.usn || "-"}
              </strong>
            </div>

            <div>
              <span>
                EMAIL
              </span>

              <strong>
                {user?.email || "-"}
              </strong>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;