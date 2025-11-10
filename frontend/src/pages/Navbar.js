import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Navigation items
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Notes", path: "/notes" },
    { label: "Courses", path: "/courses" },
    { label: "Timetable", path: "/timetable" },
    { label: "PYQs", path: "https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD", external: true },
    { label: "Ask Doubt", path: "/ask-doubt" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">📚</span>
        <span className="navbar-title">StudyHub</span>
      </div>

      <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              to={link.path}
              className={`nav-link ${
                location.pathname === link.path ? "active" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </header>
  );
}
