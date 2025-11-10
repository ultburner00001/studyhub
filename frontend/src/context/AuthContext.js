// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Minimal AuthProvider for StudyHub
 * - Stores session with localStorage key "studyhub_user_id" and "studyhub_user_name"
 * - Exposes: currentUser, loginLocal, logout, loading
 * - Designed only to satisfy app routing and simple UI. Replace with real backend auth later.
 */

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // read session from localStorage on mount
    const id = localStorage.getItem("studyhub_user_id");
    const name = localStorage.getItem("studyhub_user_name");
    if (id) setCurrentUser({ id, name: name || null });
    setLoading(false);
  }, []);

  const loginLocal = ({ id, name }) => {
    // helper for pages to set a local session (used by local fallback login)
    localStorage.setItem("studyhub_user_id", id);
    if (name) localStorage.setItem("studyhub_user_name", name);
    setCurrentUser({ id, name });
  };

  const logout = () => {
    localStorage.removeItem("studyhub_user_id");
    localStorage.removeItem("studyhub_user_name");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    loginLocal,
    logout,
    isLoggedIn: Boolean(currentUser),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
