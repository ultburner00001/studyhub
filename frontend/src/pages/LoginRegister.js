import React, { useState } from "react";
import "./LoginRegister.css";

const API = "https://studyhub-21ux.onrender.com/api"; // replace with your Render backend URL

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const toggleForm = () => setIsLogin(!isLogin);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Loading...");
    const url = `${API}/${isLogin ? "login" : "register"}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("studyhub_user_id", data.userId);
      localStorage.setItem("studyhub_user_name", data.name);
      window.location.href = "/notes";
    } else setMsg(data.message || "Error");
  };

  return (
    <div className="login-register-container">
      <div className="form-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
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
        <p>{msg}</p>
        <p>
          {isLogin ? "No account?" : "Have an account?"}{" "}
          <button onClick={toggleForm} className="link-btn">
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
