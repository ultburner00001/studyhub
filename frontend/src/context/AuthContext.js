// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Very small AuthContext:
 * - Uses localStorage keys: studyhub_user_id, studyhub_user_name
 * - Exposes: currentUser, loading, login, register, logout
 * - Tries backend (fetch) if REACT_APP_API_BASE is set; otherwise works purely local
 */

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // { id, name } or null
  const [loading, setLoading] = useState(true);

  // load session from localStorage on mount
  useEffect(() => {
    const id = localStorage.getItem("studyhub_user_id");
    const name = localStorage.getItem("studyhub_user_name");
    if (id) {
      setCurrentUser({ id, name: name || "User" });
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  // helper to persist session locally
  const setSession = (user) => {
    if (!user) {
      localStorage.removeItem("studyhub_user_id");
      localStorage.removeItem("studyhub_user_name");
      setCurrentUser(null);
      return;
    }
    localStorage.setItem("studyhub_user_id", user.id);
    if (user.name) localStorage.setItem("studyhub_user_name", user.name);
    setCurrentUser({ id: user.id, name: user.name });
  };

  // register: tries backend, otherwise falls back to local-only store
  const register = async ({ name, email, password }) => {
    // basic client validation
    if (!name || !email || !password) {
      return { success: false, message: "All fields required" };
    }

    // try backend if available
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data?.success) {
        const user = { id: data.userId || data.id || data._id || String(Date.now()), name: data.name || name };
        setSession(user);
        return { success: true, user };
      }
      // backend returned a non-success response
      // fall through to local fallback only if backend responded but didn't create user
      return { success: false, message: data?.message || "Registration failed" };
    } catch (err) {
      // Backend not reachable or error -> fallback to local registration using localStorage users map
      try {
        const usersKey = "studyhub_users";
        const raw = localStorage.getItem(usersKey) || "{}";
        const users = JSON.parse(raw);
        const em = email.trim().toLowerCase();
        if (users[em]) return { success: false, message: "Email already registered (local fallback)" };
        const id = "u_" + Math.random().toString(36).slice(2, 9);
        users[em] = { id, name, email: em, password };
        localStorage.setItem(usersKey, JSON.stringify(users));
        const user = { id, name };
        setSession(user);
        return { success: true, user, fallback: true };
      } catch (e) {
        return { success: false, message: "Registration failed (unexpected error)" };
      }
    }
  };

  // login: tries backend, otherwise falls back to local-only check
  const login = async ({ email, password }) => {
    if (!email || !password) return { success: false, message: "Email & password required" };

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data?.success) {
        const user = { id: data.userId || data.id || data._id || String(Date.now()), name: data.name || "User" };
        setSession(user);
        return { success: true, user };
      }
      return { success: false, message: data?.message || "Invalid credentials" };
    } catch (err) {
      // fallback local check
      try {
        const usersKey = "studyhub_users";
        const raw = localStorage.getItem(usersKey) || "{}";
        const users = JSON.parse(raw);
        const em = email.trim().toLowerCase();
        const u = users[em];
        if (!u || u.password !== password) return { success: false, message: "Invalid credentials (local fallback)" };
        const user = { id: u.id, name: u.name };
        setSession(user);
        return { success: true, user, fallback: true };
      } catch (e) {
        return { success: false, message: "Login failed (unexpected error)" };
      }
    }
  };

  const logout = () => {
    setSession(null);
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
