import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

// ✅ Use your Render backend URL
const API_URL =
  process.env.REACT_APP_API_URL || "https://studyhub-21ux.onrender.com/api";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Handle login/register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API_URL}${endpoint}`, formData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        navigate("/"); // Go to Home
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error.");
    }
  };

  // 🔹 Skip login
  const handleSkip = () => {
    localStorage.removeItem("token"); // Remove any stored token
    navigate("/"); // Go directly to Home
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>📚 StudyHub</h1>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        <form onSubmit={handleSubmit}>
          {/* Show name field only for register */}
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-accent">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="link-btn">
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="link-btn">
                Login
              </button>
            </>
          )}
        </p>

        {/* 🚀 Continue Without Login */}
        <div className="skip-section">
          <p>or</p>
          <button className="btn btn-outline" onClick={handleSkip}>
            Continue without login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
