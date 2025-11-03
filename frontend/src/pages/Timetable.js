import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Timetable.css";
import { Link } from "react-router-dom";

const API_BASE = "https://studyhub-21ux.onrender.com/api/timetable";

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [day, setDay] = useState("Monday");
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [teacher, setTeacher] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Show temporary toast message
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch Timetable for logged-in user
  const fetchTimetable = async () => {
    try {
      const userId = localStorage.getItem("studyhub_user_id");
      const res = await axios.get(`${API_BASE}?userId=${userId}`);
      setTimetable(res.data.data || {});
    } catch (err) {
      console.error("⚠️ Fetch Timetable error:", err);
      showToast("Failed to load timetable", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Add a class
  const handleAdd = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("studyhub_user_id");
    if (!userId) return showToast("Login required", "warning");

    if (!subject.trim() || !time.trim()) {
      return showToast("Please fill all fields", "warning");
    }

    try {
      const res = await axios.post(API_BASE, {
        userId,
        day,
        subject,
        time,
        teacher,
      });
      showToast("Class added successfully!", "success");
      setSubject("");
      setTime("");
      setTeacher("");
      fetchTimetable();
    } catch (err) {
      console.error("Add Error:", err);
      showToast("Failed to add class", "error");
    }
  };

  // Delete a class
  const handleDelete = async (classId) => {
    try {
      await axios.delete(`${API_BASE}/${classId}`);
      showToast("Class deleted", "success");
      fetchTimetable();
    } catch (err) {
      console.error("Delete Error:", err);
      showToast("Failed to delete", "error");
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
      {/* ===== NAVBAR ===== */}
      <header className="topbar gradient-nav">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">
            StudyHub
          </Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">
            Notes
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          <Link to="/timetable" className="nav-link active">
            Timetable
          </Link>
          <a
            href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            PYQs
          </a>
          <Link to="/ask-doubt" className="nav-link">
            Ask Doubt
          </Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">
            🏠 Home
          </Link>
        </div>
      </header>

      {/* ===== FORM ===== */}
      <div className="form-card">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
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
          placeholder="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teacher (optional)"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAdd}>
          ➕ Add Class
        </button>
      </div>

      {/* ===== TIMETABLE DISPLAY ===== */}
      {loading ? (
        <p className="loading">Loading timetable...</p>
      ) : (
        <div className="timetable-container">
          {days.map((dayName) => {
            const classes =
              (Array.isArray(timetable[dayName]) && timetable[dayName]) || [];
            return (
              <div key={dayName} className="day-card">
                <h2>{dayName}</h2>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <div key={cls._id} className="class-item">
                      <div className="class-info">
                        <p>
                          <strong>{cls.subject}</strong> — {cls.time}
                        </p>
                        {cls.teacher && (
                          <p className="teacher">👨‍🏫 {cls.teacher}</p>
                        )}
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(cls._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty">No classes yet</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== TOAST MESSAGE ===== */}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default Timetable;
