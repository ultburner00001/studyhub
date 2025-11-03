// src/pages/Timetable.js
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

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("studyhub_user_id");
      if (!userId) {
        showToast("Login required (set studyhub_user_id in localStorage)", "warning");
        setTimetable({});
        return;
      }

      const res = await axios.get(${API_BASE}?userId=${encodeURIComponent(userId)});
      // backend should return an array of class objects in res.data.data (or res.data)
      const allClasses = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];

      // Group classes by day
      const grouped = allClasses.reduce((acc, cls) => {
        const d = cls.day || "Other";
        if (!acc[d]) acc[d] = [];
        acc[d].push(cls);
        return acc;
      }, {});

      setTimetable(grouped);
    } catch (err) {
      console.error("⚠ Fetch Timetable error:", err);
      showToast("Failed to load timetable", "error");
      setTimetable({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("studyhub_user_id");
    if (!userId) {
      return showToast("Login required", "warning");
    }
    if (!subject.trim() || !time.trim()) {
      return showToast("Please fill subject and time", "warning");
    }

    try {
      await axios.post(API_BASE, {
        userId,
        day,
        subject: subject.trim(),
        time: time.trim(),
        teacher: teacher.trim() || undefined,
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

  const handleDelete = async (classId) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await axios.delete(${API_BASE}/${classId});
      showToast("Class deleted", "success");
      fetchTimetable();
    } catch (err) {
      console.error("Delete Error:", err);
      showToast("Failed to delete", "error");
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="timetable-page">
      {/* NAVBAR */}
      <header className="topbar gradient-nav">
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

      {/* FORM */}
      <div className="form-card">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
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
          placeholder="Time (e.g. 9:00 AM)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <input
          type="text"
          placeholder="Teacher (optional)"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAdd}>➕ Add Class</button>
      </div>

      {/* TIMETABLE DISPLAY */}
      {loading ? (
        <p className="loading">Loading timetable...</p>
      ) : (
        <div className="timetable-container">
          {days.map((dayName) => {
            const classes = Array.isArray(timetable[dayName]) ? timetable[dayName] : [];
            return (
              <div key={dayName} className="day-card">
                <h2>{dayName}</h2>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <div key={cls._id || cls.id} className="class-item">
                      <div className="class-info">
                        <p><strong>{cls.subject}</strong> — {cls.time}</p>
                        {cls.teacher && <p className="teacher">👨‍🏫 {cls.teacher}</p>}
                      </div>
                      <button className="btn-delete" onClick={() => handleDelete(cls._id || cls.id)}>🗑</button>
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

      {/* TOAST */}
      {toast && <div className={toast ${toast.type}}>{toast.message}</div>}
    </div>
  );
};

export default Timetable;
