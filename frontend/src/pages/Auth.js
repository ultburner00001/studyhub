// src/pages/Auth.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css"; // adjust path if you use different filename

/**
 * Minimal Auth page (login/register).
 * - Tries backend at REACT_APP_API_BASE or fallback to /api
 * - Falls back to localStorage user map if backend unreachable
 * - Stores session in localStorage.studyhub_user_id and studyhub_user_name
 */

const API_BASE = process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem("studyhub_users") || "{}");
  } catch {
    return {};
  }
}
function writeUsers(u) {
  localStorage.setItem("studyhub_users", JSON.stringify(u));
}

export default function Auth() {
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const setSession = (user) => {
    localStorage.setItem("studyhub_user_id", user.id);
    localStorage.setItem("studyhub_user_name", user.name || "");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { name, email, password } = form;
    if (!email || !password || (!isLogin && !name)) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // if backend responded
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          const user = { id: data.userId || data.id || String(Date.now()), name: data.name || name || email };
          setSession(user);
          setMsg({ type: "success", text: `${isLogin ? "Logged in" : "Registered"} successfully` });
          setTimeout(() => nav("/notes"), 500);
          return;
        } else {
          // Backend responded with success:false
          setMsg({ type: "error", text: data.message || "Auth failed" });
          setLoading(false);
          return;
        }
      }
      // Non-OK status falls through to next block to do fallback
      throw new Error("Backend not available");
    } catch (err) {
      // Fallback: localStorage user map
      try {
        const users = readUsers();
        const em = email.trim().toLowerCase();
        if (isLogin) {
          const u = users[em];
          if (!u || u.password !== password) {
            setMsg({ type: "error", text: "Invalid credentials (local fallback)" });
            setLoading(false);
            return;
          }
          setSession({ id: u.id, name: u.name });
          setMsg({ type: "success", text: "Logged in (local fallback)" });
          setTimeout(() => nav("/notes"), 400);
        } else {
          if (users[em]) {
            setMsg({ type: "error", text: "Email already registered (local fallback)" });
            setLoading(false);
            return;
          }
          const id = "u_" + Math.random().toString(36).slice(2, 9);
          users[em] = { id, name, email: em, password };
          writeUsers(users);
          setSession({ id, name });
          setMsg({ type: "success", text: "Registered (local fallback)" });
          setTimeout(() => nav("/notes"), 600);
        }
      } catch (e) {
        console.error("Auth error:", e);
        setMsg({ type: "error", text: "Authentication failed" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-register-container">
      <div className="form-card">
        <h2>{isLogin ? "Login to StudyHub" : "Create an account"}</h2>

        <form onSubmit={onSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required={!isLogin}
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

          <button type="submit" disabled={loading}>
            {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            className="link-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setMsg(null);
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

        {msg && (
          <div style={{ marginTop: 10, color: msg.type === "error" ? "#c0392b" : "#2ecc71" }}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
