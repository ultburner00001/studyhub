// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

export default function Home() {
  const features = [
    { emoji: "📝", title: "Notes", desc: "Create and organize study notes", link: "/notes" },
    { emoji: "🎓", title: "Courses", desc: "Learn from curated courses", link: "/courses" },
    { emoji: "🕒", title: "Timetable", desc: "Plan your study schedule", link: "/timetable" },
    { emoji: "📚", title: "PYQs", desc: "Previous year questions", link: "https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD" },
    { emoji: "❓", title: "Ask Doubt", desc: "Get help from community", link: "/ask-doubt" },
  ];

  return (
    <>
      <Navbar />
      <div className="home-page" style={{ padding: 20 }}>
        <section className="hero" style={{ padding: 30, textAlign: "center" }}>
          <h1 style={{ marginBottom: 8 }}>An Investment In Knowledge Pays The Best Interest</h1>
          <p style={{ marginBottom: 16 }}>
            StudyHub — notes, timetable, courses and community help all in one place.
          </p>
          <Link to="/courses" className="btn btn-accent">Explore Courses</Link>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2>Explore</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {features.map((f) => (
              f.link.startsWith("http") ? (
                <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className="card-link" style={cardStyle}>
                  <div style={{ fontSize: 28 }}>{f.emoji}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </a>
              ) : (
                <Link key={f.title} to={f.link} className="card-link" style={cardStyle}>
                  <div style={{ fontSize: 28 }}>{f.emoji}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </Link>
              )
            ))}
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Popular Courses</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={courseCard}>
              <h4>Intro to Python</h4>
              <p>Beginner · 8 weeks</p>
              <a href="https://www.youtube.com/watch?v=nLRL_NcnK-4" target="_blank" rel="noreferrer">Preview</a>
            </div>
            <div style={courseCard}>
              <h4>Web Development</h4>
              <p>Core CS · 12 weeks</p>
              <a href="https://www.youtube.com/watch?v=nu_pCVPKzTk" target="_blank" rel="noreferrer">Preview</a>
            </div>
            <div style={courseCard}>
              <h4>Power BI</h4>
              <p>Business · 6 weeks</p>
              <a href="https://www.youtube.com/watch?v=FwjaHCVNBWA" target="_blank" rel="noreferrer">Preview</a>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 40, textAlign: "center", color: "#666" }}>
          © {new Date().getFullYear()} StudyHub
        </footer>
      </div>
    </>
  );
}

const cardStyle = {
  padding: 14,
  borderRadius: 8,
  border: "1px solid #eee",
  textDecoration: "none",
  color: "inherit",
  background: "#fff"
};

const courseCard = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #eee",
  width: 220,
};
