import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Timetable.css";

function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [activeDay, setActiveDay] = useState("Monday");
  const [newSlot, setNewSlot] = useState({ day: "Monday", time: "", subject: "", topic: "" });
  const [editingSlot, setEditingSlot] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Static days and times
  const days = useMemo(
    () => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    []
  );

  const timeSlots = useMemo(
    () => [
      "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
      "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
      "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"
    ],
    []
  );

  // Show notifications
  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("studyhub_timetable");
    if (saved) {
      setSchedule(JSON.parse(saved));
    } else {
      setSchedule(days.map((d) => ({ day: d, slots: [] })));
    }
  }, [days]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("studyhub_timetable", JSON.stringify(schedule));
  }, [schedule]);

  const addSlot = () => {
    if (!newSlot.time || !newSlot.subject) {
      showNotification("Please fill in both time and subject", "warning");
      return;
    }

    const updatedSchedule = schedule.map((day) => {
      if (day.day === newSlot.day) {
        const slotExists = day.slots.some((s) => s.time === newSlot.time);
        if (slotExists) {
          showNotification("Slot already exists at this time", "error");
          return day;
        }
        return {
          ...day,
          slots: [...day.slots, { ...newSlot, isCompleted: false }]
        };
      }
      return day;
    });

    setSchedule(updatedSchedule);
    setNewSlot({ day: "Monday", time: "", subject: "", topic: "" });
    showNotification("Session added successfully", "success");
  };

  const deleteSlot = (day, time) => {
    const updatedSchedule = schedule.map((d) =>
      d.day === day ? { ...d, slots: d.slots.filter((s) => s.time !== time) } : d
    );
    setSchedule(updatedSchedule);
    showNotification("Session deleted", "info");
  };

  const toggleComplete = (day, time) => {
    const updatedSchedule = schedule.map((d) =>
      d.day === day
        ? {
            ...d,
            slots: d.slots.map((s) =>
              s.time === time ? { ...s, isCompleted: !s.isCompleted } : s
            )
          }
        : d
    );
    setSchedule(updatedSchedule);
  };

  const startEdit = (day, time) => {
    setEditingSlot({ day, time });
  };

  const saveEdit = (day, time, newData) => {
    const updatedSchedule = schedule.map((d) =>
      d.day === day
        ? {
            ...d,
            slots: d.slots.map((s) => (s.time === time ? { ...s, ...newData } : s))
          }
        : d
    );
    setSchedule(updatedSchedule);
    setEditingSlot(null);
  };

  const getDayData = (day) => schedule.find((d) => d.day === day) || { slots: [] };

  return (
    <div className="timetable-page">
      {/* Notifications */}
      <div className="notifications">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>

      {/* Navbar */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link active">Timetable</Link>
          <a href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD"
             target="_blank" rel="noopener noreferrer" className="nav-link">PYQs</a>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="timetable-container">
        <h1>📅 Study Timetable</h1>
        <p>Plan and track your daily study sessions easily!</p>

        {/* Add Session */}
        <div className="add-slot-form">
          <h3>Add New Session</h3>
          <div className="form-grid">
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
            >
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select
              value={newSlot.time}
              onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
            >
              <option value="">Select Time</option>
              {timeSlots.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Subject"
              value={newSlot.subject}
              onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
            />
            <input
              type="text"
              placeholder="Topic (optional)"
              value={newSlot.topic}
              onChange={(e) => setNewSlot({ ...newSlot, topic: e.target.value })}
            />
            <button className="btn btn-primary" onClick={addSlot}>
              Add
            </button>
          </div>
        </div>

        {/* Tabs for Days */}
        <div className="days-tabs">
          {days.map((day) => (
            <button
              key={day}
              className={`day-tab ${activeDay === day ? "active" : ""}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule Display */}
        <div className="day-schedule">
          <h2>{activeDay}</h2>
          <div className="schedule-slots">
            {timeSlots.map((time) => {
              const slot = getDayData(activeDay).slots.find((s) => s.time === time);
              return (
                <div key={time} className="slot-row">
                  <div className="time">{time}</div>
                  {slot ? (
                    editingSlot &&
                    editingSlot.day === activeDay &&
                    editingSlot.time === time ? (
                      <div className="slot-edit">
                        <input
                          value={slot.subject}
                          onChange={(e) =>
                            saveEdit(activeDay, time, { subject: e.target.value })
                          }
                        />
                        <input
                          value={slot.topic || ""}
                          onChange={(e) =>
                            saveEdit(activeDay, time, { topic: e.target.value })
                          }
                        />
                        <button className="btn btn-small" onClick={() => setEditingSlot(null)}>
                          ✅ Done
                        </button>
                      </div>
                    ) : (
                      <div className={`slot-card ${slot.isCompleted ? "completed" : ""}`}>
                        <div>
                          <strong>{slot.subject}</strong>
                          {slot.topic && <div className="topic">{slot.topic}</div>}
                        </div>
                        <div className="actions">
                          <button onClick={() => toggleComplete(activeDay, time)}>
                            {slot.isCompleted ? "✅" : "⭕"}
                          </button>
                          <button onClick={() => startEdit(activeDay, time)}>✏️</button>
                          <button onClick={() => deleteSlot(activeDay, time)}>🗑️</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="slot-empty">No session</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timetable;
