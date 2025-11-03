import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Added for navigation

const Timetable = () => {
  const [schedule, setSchedule] = useState({});
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("studyhub_user_id");

  // ✅ Fetch timetable for user
  const fetchTimetable = async () => {
    if (!userId) {
      setLoading(false); // Stop loading if no user ID
      return;
    }
    try {
      const res = await fetch(
        `https://studyhub-21ux.onrender.com/api/timetable/${userId}`
      );
      const data = await res.json();
      // Ensure data.schedule is an object before setting
      setSchedule(data?.schedule && typeof data.schedule === 'object' ? data.schedule : {});
    } catch (err) {
      console.error("⚠️ Fetch timetable error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add timetable entry
  const handleAdd = async () => {
    if (!day || !time || !subject) return alert("Please fill day, time, and subject.");
    
    // Simple validation to prevent adding to a schedule that might not be initialised
    if (loading) return; 

    try {
      const res = await fetch(
        `https://studyhub-21ux.onrender.com/api/timetable/add/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, time, subject, topic }),
        }
      );
      if (res.ok) {
        await fetchTimetable();
        // Reset only the fields that were input
        setTime("");
        setSubject("");
        setTopic("");
      } else {
        const errorData = await res.json();
        alert(`Failed to add entry: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error("⚠️ Add timetable error:", err);
      alert("An unexpected error occurred while adding the entry.");
    }
  };

  // ✅ Delete timetable entry
  const handleDelete = async (day, index) => {
    if (loading) return; // Prevent deletion while loading
    
    try {
      const res = await fetch(
        `https://studyhub-21ux.onrender.com/api/timetable/delete/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, index }),
        }
      );
      if (res.ok) {
          fetchTimetable();
      } else {
          const errorData = await res.json();
          alert(`Failed to delete entry: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error("⚠️ Delete timetable error:", err);
      alert("An unexpected error occurred while deleting the entry.");
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (!userId) return <div className="page timetable-page-error">Please log in to view your timetable.</div>;
  if (loading) return <p className="loading-message">Loading timetable...</p>;

  return (
    <div className="page timetable-page">
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
          className="nav-link external"
        >
          PYQs
        </a>
        <Link to="/ask-doubt" className="nav-link">
          AskDoubt
        </Link>
      </nav>
      
      <div className="timetable-content">
        <h2 className="page-title">🕒 Weekly Timetable</h2>

        {/* ✅ Add New Entry */}
        <div className="add-entry-card">
          <select value={day} onChange={(e) => setDay(e.target.value)} className="form-select">
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="form-input"
            aria-label="Time"
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
            aria-label="Subject"
          />
          <input
            type="text"
            placeholder="Topic (optional)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="form-input"
            aria-label="Topic"
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Add Entry
          </button>
        </div>
        
        <hr className="divider" />

        {/* ✅ Display Timetable */}
        <div className="schedule-grid">
          {days.map((dayName) => {
            const items = Array.isArray(schedule?.[dayName]) ? schedule[dayName] : [];
            return (
              <div key={dayName} className="day-column">
                <h3 className="day-header">{dayName}</h3>
                {items.length > 0 ? (
                  // Sort items by time before mapping
                  [...items].sort((a, b) => a.time.localeCompare(b.time)).map((entry, i) => (
                    <div key={i} className="subject-card">
                      <div className="subject-time">{entry.time}</div>
                      <div className="subject-details">
                          <strong>{entry.subject}</strong>
                          {entry.topic && <span className="subject-topic">{entry.topic}</span>}
                      </div>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(dayName, i)}
                        aria-label={`Delete entry for ${dayName} at ${entry.time}`}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-slot">Free slot</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
