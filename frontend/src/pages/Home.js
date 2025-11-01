import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  
  const menu = [
    { label: "Notes", href: "/notes" },
    { label: "Courses", href: "/courses" },
    { label: "Timetable", href: "/timetable" },
    { label: "PYQs", href: "https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD" },
    { label: "AskDoubt", href: "/ask-doubt" },
  ];
  
  const featureCards = [
    { emoji: "📝", title: "Notes", text: "Create and organize your study notes", link:"http://localhost:3000/notes" },
    { emoji: "🎓", title: "Courses", text: "Learn from comprehensive courses", link:"http://localhost:3000/courses" },
    { emoji: "🕒", title: "Timetable", text: "Plan your study schedule", link:"http://localhost:3000/timetable" },
    { emoji: "📚", title: "PYQs", text: "Previous Year Questions", link: "https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD" },
    { emoji: "❓", title: "Ask-Doubt", text: "Get help from community", link:"http://localhost:3000/ask-doubt" },
  ];

  const courseCards = [
    { title: "Intro to Python", tag: "Beginner", info: "8 weeks · 40 lessons", link:"https://www.youtube.com/watch?v=nLRL_NcnK-4" },
    { title: "Web Development", tag: "Core CS", info: "12 weeks · 60 lessons", link:"https://www.youtube.com/watch?v=nu_pCVPKzTk" },
    { title: "Power Bi", tag: "Business", info: "6 weeks · 30 lessons", link:"https://www.youtube.com/watch?v=FwjaHCVNBWA" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className={"nav " + (open ? "open" : "")}>
          {menu.map((m) => (
            m.label === "PYQs" ? (
              <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="nav-link">
                {m.label}
              </a>
            ) : (
              <Link key={m.label} to={m.href} className="nav-link">
                {m.label}
              </Link>
            )
          ))}
        </nav>
        <div className="actions">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-greeting">Hello, {currentUser.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setOpen(!open)}
                aria-label="Toggle Menu"
              >
                ☰
              </button>
              <Link to="/auth" className="btn btn-accent">Login / Register</Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>An Investment In Knowledge Pays The Best Interest</h1>
          <p>
            Learn smarter with notes, courses, timetable planning and instant doubt support — all in one place.
          </p>
          {!currentUser && (
            <div className="cta">
              <Link to="/auth" className="btn btn-accent">Get Started</Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="strip">
        <div className="strip-left">
          <h2>Everything you need to excel in your studies</h2>
          <p>Comprehensive tools and resources for effective learning</p>
        </div>
        <div className="strip-cards">
          {featureCards.map((f) => (
            f.title === "PYQs" ? (
              <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className="card-link">
                <div className="card">
                  <div className="icon">{f.emoji}</div>
                  <div className="card-title">{f.title}</div>
                  <div className="card-text">{f.text}</div>
                </div>
              </a>
            ) : (
              <Link key={f.title} to={f.href || `/${f.title.toLowerCase().replace(' ', '-')}`} className="card-link">
                <div className="card">
                  <div className="icon">{f.emoji}</div>
                  <div className="card-title">{f.title}</div>
                  <div className="card-text">{f.text}</div>
                </div>
              </Link>
            )
          ))}
        </div>
      </section>

      {/* POPULAR COURSES AT BOTTOM */}
      <section className="section" id="courses">
        <div className="section-head">
          <h3>Popular Courses</h3>
          <Link className="link" to="/courses">
            View all →
          </Link>
        </div>
        <div className="grid">
          {courseCards.map((c) => (
            <article key={c.title} className="course">
              <div className="course-badge">{c.tag}</div>
              <h4>{c.title}</h4>
              <p>{c.info}</p>
              <button className="btn btn-primary">Enroll</button>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} StudyHub • Built with React & Node.js
      </footer>
    </div>
  );
}

export default Home;