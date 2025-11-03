import React, { useEffect, useState } from "react";

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
    if (!userId) return;
    try {
      const res = await fetch(
        `https://studyhub-21ux.onrender.com/api/timetable/${userId}`
      );
      const data = await res.json();
      setSchedule(data?.schedule || {}); // fallback to empty object
    } catch (err) {
      console.error("⚠️ Fetch timetable error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add timetable entry
  const handleAdd = async () => {
    if (!day || !time || !subject) return alert("Please fill all fields");
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
        setTime("");
        setSubject("");
        setTopic("");
      }
    } catch (err) {
      console.error("⚠️ Add timetable error:", err);
    }
  };

  // ✅ Delete timetable entry
  const handleDelete = async (day, index) => {
    try {
      const res = await fetch(
        `https://studyhub-21ux.onrender.com/api/timetable/delete/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, index }),
        }
      );
      if (res.ok) fetchTimetable();
    } catch (err) {
      console.error("⚠️ Delete timetable error:", err);
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

  if (loading) return <p className="loading">Loading timetable...</p>;

  return (
    <div className="page timetable">
      <h2>🕒 Weekly Timetable</h2>

      {/* ✅ Add New Entry */}
      <div className="form-card">
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Topic (optional)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className="btn btn-add" onClick={handleAdd}>
          ➕ Add
        </button>
      </div>

      {/* ✅ Display Timetable */}
      <div className="schedule-list">
        {days.map((day) => {
          const items = Array.isArray(schedule?.[day]) ? schedule[day] : [];
          return (
            <div key={day} className="day-section">
              <h3>{day}</h3>
              {items.length > 0 ? (
                items.map((entry, i) => (
                  <div key={i} className="subject-card">
                    <div><strong>Time:</strong> {entry.time}</div>
                    <div><strong>Subject:</strong> {entry.subject}</div>
                    {entry.topic && <div><strong>Topic:</strong> {entry.topic}</div>}
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(day, i)}
                    >
                      🗑️ Delete
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
    </div>
  );
};

export default Timetable;
