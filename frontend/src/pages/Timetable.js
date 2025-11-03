import React, { useEffect, useState, useCallback } from "react";
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

// ✅ Get userId from localStorage
function getUserIdFromStorage() {
  try {
    const keys = ["studyhub_user_id", "userId", "_id"];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) return val;
    }
  } catch {}
  return null;
}

export default function Timetable() {
  const [timetable, setTimetable] = useState({});
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [teacher, setTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const notify = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ✅ Fetch timetable for logged in user
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserIdFromStorage();
      if (!userId) {
        notify("⚠️ Please login or set user ID in localStorage", "warning");
        setLoading(false);
        return;
      }

      const res = await http.get("/timetable", { params: { userId } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        // Convert array → grouped by day
        const grouped = {};
        res.data.data.forEach((item) => {
          const day = item.day || "Unknown";
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(item);
        });
        setTimetable(grouped);
      } else if (Array.isArray(res.data)) {
        const grouped = {};
        res.data.forEach((item) => {
          const day = item.day || "Unknown";
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(item);
        });
        setTimetable(grouped);
      } else {
        setTimetable({});
      }
    } catch (err) {
      console.error("⚠️ Fetch timetable error:", err);
      notify("Failed to fetch timetable", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // ✅ Add a new class
  const addSubject = async () => {
    const userId = getUserIdFromStorage();
    if (!userId) return notify("Please login before adding", "error");
    if (!subject.trim() || !time.trim()) return notify("Enter subject and time", "warning");

    try {
      const payload = { day: selectedDay, subject, time, teacher, userId };
      const res = await http.post("/timetable", payload);
      if (res.data?.success) {
        notify("✅ Subject added successfully!", "success");
        setSubject("");
        setTime("");
        setTeacher("");
        fetchTimetable();
      } else {
        notify("❌ Failed to add subject", "error");
      }
    } catch (err) {
      console.error("⚠️ Add subject error:", err);
      notify("Error adding subject", "error");
    }
  };

  // ✅ Delete a class
  const deleteSubject = async (id) => {
    const userId = getUserIdFromStorage();
    if (!userId) return notify("Please login before deleting", "error");
    if (!window.confirm("Delete this class?")) return;

    try {
      const res = await http.delete(`/timetable/${id}`, { params: { userId } });
      if (res.data?.success) {
        notify("🗑️ Deleted successfully", "success");
        fetchTimetable();
      } else {
        notify("❌ Delete failed", "error");
      }
    } catch (err) {
      console.error("⚠️ Delete error:", err);
      notify("Error deleting class", "error");
    }
  };

  return (
    <div className="timetable-page">
      {message && <div className={`toast ${message.type}`}>{message.text}</div>}

      {/* === NAVBAR === */}
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

      {/* === ADD SUBJECT FORM === */}
      <section className="form-card">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
          {days.map((day) => (
            <option key={day}>{day}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Time (e.g., 9:00 AM)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teacher (optional)"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addSubject}>+ Add Class</button>
      </section>

      {/* === DISPLAY TIMETABLE === */}
      {loading ? (
        <div className="loading">⏳ Loading timetable...</div>
      ) : (
        <div className="timetable-container">
          {days.map((day) => {
            const classes = timetable[day] || [];
            return (
              <div key={day} className="day-card">
                <h2>{day}</h2>
                {classes.length > 0 ? (
                  classes.map((c) => (
                    <div key={c._id || c.id} className="class-item">
                      <div className="class-info">
                        <p><b>Subject:</b> {c.subject}</p>
                        <p><b>Time:</b> {c.time}</p>
                        {c.teacher && <p><b>Teacher:</b> {c.teacher}</p>}
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => deleteSubject(c._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty">📭 No classes yet</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
