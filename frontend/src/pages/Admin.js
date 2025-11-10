// src/pages/Admin.js
import React from "react";
import Navbar from "../components/Navbar";

export default function Admin() {
  return (
    <>
      <Navbar />
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: "#444" }}>
          This is a minimal placeholder Admin page. Add admin controls here later.
        </p>

        <section style={{ marginTop: 18, background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #eee" }}>
          <h3 style={{ marginBottom: 8 }}>Quick actions</h3>
          <ul>
            <li>View users (coming soon)</li>
            <li>Manage notes (coming soon)</li>
            <li>System status</li>
          </ul>
        </section>

        <section style={{ marginTop: 18 }}>
          <h3>System status</h3>
          <p style={{ color: "#2d3748" }}>
            API base: <code>{process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api"}</code>
          </p>
        </section>
      </div>
    </>
  );
}
