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

// ✅ Helper: Fetch user ID from localStorage or token
function getUserIdFromStorage() {
  try {
    const idKeys = ["studyhub_user_id", "userId", "_id"];
    for (const k of idKeys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    const token = localStorage.getItem("studyhub_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload.sub || payload.userId;
    }
  } catch {
    return null;
  }
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
    setTimeout(() => setMessage(null), 2500);
  };

  // === Fetch timetable from backend ===
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserIdFromStorage();
      if (!userId) {
        notify("Not logged in — please set user ID or login", "warning");
        setLoading(false);
        return;
      }

      const res = await http.get("/timetable", { params: { userId } });
      const data = res.data?.timetable || res.data?.data || {};
      setTimetable(Array.isArray(data) ? {} : data);
    } catch (err) {
      console.error("⚠️ Fetch timetable error:", err);
      notify("Error fetching timetable", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // === Add a subject ===
  const addSubject = async () => {
    const userId = getUserIdFromStorage();
    if (!userId) return notify("Please login before adding subjects", "error");
    if (!subject.trim() || !time.trim()) return notify("Enter subject and time", "warning");

    try {
      const payload = { day: selectedDay, subject, time, teacher, userId };
      const res = await http.post("/timetable", payload);

      if (res.data?.success) {
        notify("✅ Subject added");
        setSubject("");
        setTime("");
        setTeacher("");
        fetchTimetable();
      } else notify("❌ Could not add subject", "error");
    } catch (err) {
      console.error("⚠️ Add subject error:", err);
      notify("Error adding subject", "error");
    }
  };

  // === Delete a subject ===
  const deleteSubject = async (day, id) => {
    const userId = getUserIdFromStorage();
    if (!userId) return notify("Please login before deleting", "error");

    try {
      const res = await http.delete(`/timetable/${id}`, { params: { userId } });
      if (res.data?.success) {
        notify("🗑️ Deleted successfully");
        fetchTimetable();
      } else notify("❌ Delete failed", "error");
    } catch (err) {
      console.error("⚠️ Delete error:", err);
      notify("Error deleting subject", "error");
    }
  };

  return (
    <div className="page timetable">
      {message && <div className={`toast ${message.type}`}>{message.text}</div>}

      {/* === Navbar === */}
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
          <Link to="/ask-doubt" className="nav-link">AskDoubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">🏠 Home</Link>
        </div>
      </header>

      {/* === Add Subject Form === */}
      <section className="form-card">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
          {days.map((d) => (
            <option key={d}>{d}</option>
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
        <button className="btn btn-add" onClick={addSubject}>+ Add</button>
      </section>

      {/* === Timetable Display === */}
      {loading ? (
        <div className="loading">⏳ Loading timetable...</div>
      ) : (
        <div className="schedule-list">
          {days.map((day) => {
            const entries = timetable[day] || [];
            return (
              <div key={day} className="day-section">
                <h3>{day}</h3>
                {Array.isArray(entries) && entries.length > 0 ? (
                  entries.map((e) => (
                    <div key={e._id || e.id} className="subject-card">
                      <div><b>Subject:</b> {e.subject}</div>
                      <div><b>Time:</b> {e.time}</div>
                      {e.teacher && <div><b>Teacher:</b> {e.teacher}</div>}
                      <button className="btn-delete" onClick={() => deleteSubject(day, e._id)}>Delete</button>
                    </div>
                  ))
                ) : (
                  <div className="empty">📭 No classes added</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
