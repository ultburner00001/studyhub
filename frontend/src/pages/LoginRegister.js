import React, { useState } from "react";
import "./LoginRegister.css";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const toggleForm = () => setIsLogin(!isLogin);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now just simulate login/register
    const fakeUserId = "user_" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("studyhub_user_id", fakeUserId);
    alert(`✅ ${isLogin ? "Logged in" : "Registered"} successfully!`);
    window.location.href = "/notes";
  };

  return (
    <div className="login-register-container">
      <div className="form-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p>
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button className="link-btn" onClick={toggleForm}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
