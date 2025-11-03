import React, { useState } from "react";
import "./LoginRegister.css";
import { useNavigate } from "react-router-dom";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const toggleMode = () => setIsLogin(!isLogin);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin
      ? "https://studyhub-21ux.onrender.com/api/auth/login"
      : "https://studyhub-21ux.onrender.com/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message);
        return;
      }

      if (isLogin) {
        localStorage.setItem("studyhub_user_id", data.userId);
        localStorage.setItem("studyhub_username", data.username);
        navigate("/"); // redirect to home
      } else {
        setMessage("✅ Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
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
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p className="toggle-link" onClick={toggleMode}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
