import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Timetable.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://studyhub-21ux.onrender.com/api";

const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Get userId like in Notes.js
function getUserIdFromStorage() {
  try {
    const userKeys = ["studyhub_user", "user", "currentUser"];
    for (const k of userKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.id || parsed._id || parsed.userId)
          return parsed.id || parsed._id || parsed.userId;
      } catch {
        if (raw && raw.length > 8) return raw;
      }
    }
    const idKeys = ["studyhub_user_id", "userId", "_id"];
    for (const k of idKeys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
  } catch {}
  return null;
}

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [newEntry, setNewEntry] = useState({
    day: "Monday",
    subject: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const notify = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserIdFromStorage();
      if (!userId) {
        notify("Please log in — no userId found.", "warning");
        setTimetable([]);
        return;
      }

      const res = await http.get("/timetable", { params: { userId } });
      setTimetable(res.data?.data || res.data?.timetable || []);
    } catch (err) {
      console.error("⚠️ Fetch timetable error:", err);
      if (err?.response?.status === 400) {
        notify("Bad request: missing userId (400)", "error");
      } else {
        notify("Error loading timetable", "error");
      }
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const addEntry = async () => {
    const { day, subject, time } = newEntry;
    if (!subject.trim() || !time.trim()) {
      return notify("Please fill subject and time", "warning");
    }

    const userId = getUserIdFromStorage();
    if (!userId) {
      notify("Not logged in", "error");
      return;
    }

    try {
      const res = await http.post("/timetable", { day, subject, time, userId });
      if (res.data?.success) {
        notify("✅ Added to timetable!", "success");
        setNewEntry({ day: "Monday", subject: "", time: "" });
        fetchTimetable();
      }
    } catch (err) {
      console.error(err);
      notify("Failed to add entry", "error");
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    const userId = getUserIdFromStorage();
    if (!userId) {
      notify("Not logged in", "error");
      return;
    }

    try {
      const res = await http.delete(`/timetable/${id}`, { params: { userId } });
      if (res.data?.success) {
        notify("🗑️ Entry deleted", "success");
        fetchTimetable();
      }
    } catch (err) {
      console.error(err);
      notify("Failed to delete", "error");
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="timetable-page">
      {message && <div className={`toast ${message.type}`}>{message.text}</div>}

      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link active">Timetable</Link>
          <a
            href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            PYQs
          </a>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">🏠 Home</Link>
        </div>
      </header>

      <div className="timetable-container">
        <div className="add-entry">
          <h2>Add Class</h2>
          <select
            value={newEntry.day}
            onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
          >
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Subject"
            value={newEntry.subject}
            onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
          />
          <input
            type="text"
            placeholder="Time (e.g., 10:00 AM)"
            value={newEntry.time}
            onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
          />
          <button onClick={addEntry} className="btn btn-primary">Add</button>
        </div>

        {loading ? (
          <div className="loading">⏳ Loading timetable...</div>
        ) : (
          <div className="days-grid">
            {days.map((day) => {
              const entries = timetable.filter((t) => t.day === day);
              return (
                <div key={day} className="day-card">
                  <h3>{day}</h3>
                  {entries.length > 0 ? (
                    entries.map((item) => (
                      <div key={item._id} className="timetable-item">
                        <div>
                          <strong>{item.subject}</strong> — {item.time}
                        </div>
                        <button
                          className="btn-delete"
                          onClick={() => deleteEntry(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty">No classes added</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
