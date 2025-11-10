import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";
/**
 * Simple client-side login/register page (dev/demo only).
 * - Stores users in localStorage under key "studyhub_users" (object keyed by email)
 * - Stores current session user id under "studyhub_user_id" and name under "studyhub_user_name"
 *
 * Drop into src/pages/LoginRegister.jsx — no other changes required.
 */

// Helpers for localStorage user map
const USERS_KEY = "studyhub_users";
const SESSION_ID_KEY = "studyhub_user_id";
const SESSION_NAME_KEY = "studyhub_user_name";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeUsers(obj) {
  localStorage.setItem(USERS_KEY, JSON.stringify(obj));
}

function genId() {
  return "u_" + Math.random().toString(36).slice(2, 9);
}

export default function LoginRegister() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem(SESSION_ID_KEY);
    const name = localStorage.getItem(SESSION_NAME_KEY);
    if (id) setCurrentUser({ id, name });
  }, []);

  function setSession(user) {
    localStorage.setItem(SESSION_ID_KEY, user.id);
    localStorage.setItem(SESSION_NAME_KEY, user.name);
    setCurrentUser({ id: user.id, name: user.name });
  }

  function clearSession() {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
    setCurrentUser(null);
  }

  function handleRegister(e) {
    e.preventDefault();
    setMsg(null);
    const email = (form.email || "").trim().toLowerCase();
    const name = (form.name || "").trim();
    const password = form.password || "";

    if (!name || !email || !password) {
      setMsg({ type: "error", text: "Please fill name, email and password." });
      return;
    }

    const users = readUsers();
    if (users[email]) {
      setMsg({ type: "error", text: "That email is already registered. Please login." });
      return;
    }

    const id = genId();
    users[email] = { id, name, email, password }; // NOTE: plain password for demo only
    writeUsers(users);

    setSession({ id, name });
    setMsg({ type: "success", text: `Registered and logged in as ${name}` });

    // redirect to home after short delay so user sees success
    setTimeout(() => nav("/"), 700);
  }

  function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    const email = (form.email || "").trim().toLowerCase();
    const password = form.password || "";

    if (!email || !password) {
      setMsg({ type: "error", text: "Please enter email and password." });
      return;
    }

    const users = readUsers();
    const u = users[email];
    if (!u || u.password !== password) {
      setMsg({ type: "error", text: "Invalid email or password." });
      return;
    }

    setSession({ id: u.id, name: u.name });
    setMsg({ type: "success", text: `Welcome back, ${u.name}` });
    setTimeout(() => nav("/"), 400);
  }

  function handleLogout() {
    clearSession();
    setMsg({ type: "info", text: "Logged out." });
    // stay on login page
  }

  // If already logged in, show a small panel with logout
  if (currentUser) {
    return (
      <div style={styles.container}>
        <h2 style={{ marginBottom: 6 }}>Welcome, {currentUser.name}</h2>
        <p style={{ marginTop: 0, marginBottom: 12 }}>You are logged in (id: {currentUser.id}).</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("/")} style={styles.button}>Go to Home</button>
          <button onClick={handleLogout} style={{ ...styles.button, background: "#e74c3c", color: "#fff" }}>Logout</button>
        </div>
        <div style={{ marginTop: 14, color: "#555" }}>
          <small>To try another account, logout and register a new one.</small>
        </div>
      </div>
    );
  }

  // Not logged in -> show login/register form
  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: 6 }}>{mode === "register" ? "Create an account" : "Login to StudyHub"}</h2>

      <form onSubmit={mode === "register" ? handleRegister : handleLogin} style={styles.form}>
        {mode === "register" && (
          <label style={styles.field}>
            <div style={styles.label}>Name</div>
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
        )}

        <label style={styles.field}>
          <div style={styles.label}>Email</div>
          <input
            type="email"
            style={styles.input}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label style={styles.field}>
          <div style={styles.label}>Password</div>
          <input
            type="password"
            style={styles.input}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" style={styles.button}>
            {mode === "register" ? "Register & Enter" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
            style={{ ...styles.button, background: "#f0f0f0" }}
          >
            {mode === "register" ? "Switch to Login" : "Switch to Register"}
          </button>
        </div>
      </form>

      {msg && (
        <div style={{ marginTop: 12, color: msg.type === "error" ? "#c0392b" : "#2ecc71" }}>{msg.text}</div>
      )}

      <div style={{ marginTop: 14, color: "#666", fontSize: 13 }}>
        <div>Dev notes:</div>
        <ul>
          <li>Users are stored in localStorage (key: <code>{USERS_KEY}</code>).</li>
          <li>
            Current session is stored as <code>{SESSION_ID_KEY}</code> (user id) and{" "}
            <code>{SESSION_NAME_KEY}</code> (user name). Your existing pages that read <code>studyhub_user_id</code>
            will continue to work.
          </li>
          <li>This is for local/dev only — do not use plain-text passwords in production.</li>
        </ul>
      </div>
    </div>
  );
}

// Tiny inline styles to avoid touching App.css
const styles = {
  container: {
    maxWidth: 520,
    margin: "40px auto",
    padding: 18,
    border: "1px solid #e6e6e6",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.03)",
  },
  form: { marginTop: 8 },
  field: { display: "block", marginBottom: 10 },
  label: { marginBottom: 6, color: "#333", fontSize: 14 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#3498db",
    color: "#fff",
  },
};
