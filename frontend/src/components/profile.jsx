import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    usn: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    semester: "",
    year: "1st Year",
    dateOfBirth: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("studentmartToken");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("studentmartToken");
          localStorage.removeItem("studentmartUser");
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load profile");
          return;
        }

        const userData = data.user || data;

        setForm({
          name: userData.name || "",
          usn: userData.usn || "",
          email: userData.email || "",
          phone: userData.phone || "",
          college: userData.college || "",
          course: userData.course || "",
          semester: userData.semester || "",
          year: userData.year || "1st Year",
          dateOfBirth: userData.dateOfBirth || "",
        });

        localStorage.setItem(
          "studentmartUser",
          JSON.stringify(userData)
        );
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError("Unable to connect to the server.");
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update profile");
        return;
      }

      const updatedUser = data.user || data;

      setForm({
        name: updatedUser.name || "",
        usn: updatedUser.usn || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        college: updatedUser.college || "",
        course: updatedUser.course || "",
        semester: updatedUser.semester || "",
        year: updatedUser.year || "1st Year",
        dateOfBirth: updatedUser.dateOfBirth || "",
      });

      localStorage.setItem(
        "studentmartUser",
        JSON.stringify(updatedUser)
      );

      setMessage("Profile updated successfully");
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Unable to update profile");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!passwords.currentPassword || !passwords.newPassword) {
      setError("Please enter both passwords");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("New password must contain at least 6 characters");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwords),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to change password");
        return;
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
      });

      setMessage("Password changed successfully");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Unable to change password");
    }
  };

  const logout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="nav-brand">StudentMart</div>

        <div className="nav-actions">
          <Link to="/dashboard">Dashboard</Link>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="profile-content">
        <div className="profile-header">
          <p className="small-label">ACCOUNT</p>

          <h1>Your Profile</h1>

          <p>View and manage your StudentMart account information.</p>
        </div>

        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

        <div className="profile-grid">
          <section className="profile-card">
            <h2>Personal information</h2>

            <form onSubmit={updateProfile}>
              <label>USN</label>
              <input
                name="usn"
                value={form.usn}
                onChange={handleChange}
                placeholder="e.g. 1MS21CS001"
              />

              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
              />

              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
              />

              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />

              <label>College</label>
              <input
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="College Name"
              />

              <label>Course</label>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />

              <label>Semester / Year</label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <button className="primary-button" type="submit">
                Save changes
              </button>
            </form>
          </section>

          <section className="profile-card">
            <h2>Change password</h2>

            <form onSubmit={changePassword}>
              <label>Current password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
              />

              <label>New password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Minimum 6 characters"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
              />

              <button className="primary-button" type="submit">
                Change password
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;