// frontend/src/components/Navbar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const items = [
    { label: "Home", to: "/" },
    { label: "Notes", to: "/notes" },
    { label: "Courses", to: "/courses" },
    { label: "Timetable", to: "/timetable" },
    { label: "PYQs", to: "https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD", external: true },
    { label: "Doubts", to: "/ask-doubt" },
  ];

  return (
    <header className="sh-navbar">
      <div className="sh-left">
        <span className="sh-logo">📚</span>
        <Link to="/" className="sh-title">StudyHub</Link>
      </div>

      <nav className={`sh-nav ${open ? "open" : ""}`}>
        {items.map((it) =>
          it.external ? (
            <a key={it.label} href={it.to} target="_blank" rel="noreferrer" className="sh-link" onClick={() => setOpen(false)}>
              {it.label}
            </a>
          ) : (
            <Link
              key={it.label}
              to={it.to}
              className={`sh-link ${loc.pathname === it.to ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          )
        )}
      </nav>

      <button className="sh-toggle" onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">☰</button>
    </header>
  );
}
