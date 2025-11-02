import React, { useState, useEffect } from "react";
import "./Timetable.css";

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState([]);

  // ✅ Fetch timetable from backend
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://studyhub-21ux.onrender.com/api/timetable");
      const data = await res.json();

      if (data.success && data.timetable.length > 0) {
        const savedSchedule = data.timetable[0].schedule;
        // Ensure all days exist
        const completeSchedule = allDays.map((day) => {
          const existing = savedSchedule.find((d) => d.day === day);
          return existing || { day, slots: [] };
        });
        setSchedule(completeSchedule);
      } else {
        setSchedule(allDays.map((day) => ({ day, slots: [] })));
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // ✅ Add slot to a day
  const addSlot = (dayIndex) => {
    const updated = [...schedule];
    updated[dayIndex].slots.push({ time: "", subject: "", topic: "" });
    setSchedule(updated);
  };

  // ✅ Update slot value
  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...schedule];
    updated[dayIndex].slots[slotIndex][field] = value;
    setSchedule(updated);
  };

  // ✅ Delete slot
  const deleteSlot = (dayIndex, slotIndex) => {
    const updated = [...schedule];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(updated);
  };

  // ✅ Delete entire day (clear all slots)
  const deleteDay = (dayIndex) => {
    const updated = [...schedule];
    updated[dayIndex].slots = [];
    setSchedule(updated);
  };

  // ✅ Save timetable to backend
  const saveTimetable = async () => {
    try {
      const res = await fetch("https://studyhub-21ux.onrender.com/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Timetable saved successfully!");
        fetchTimetable();
        setEditing(false);
      }
    } catch (err) {
      console.error("Error saving timetable:", err);
    }
  };

  return (
    <div className="timetable-wrapper">
      <div className="timetable-header">
        <h1>🗓️ Study Timetable</h1>
        {!editing && (
          <button className="btn primary" onClick={() => setEditing(true)}>
            Edit Timetable
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className={`timetable-two-column ${editing ? "active" : ""}`}>
          {/* ✅ Left: Editor */}
          {editing && (
            <div className="editor-pane">
              <h2>Edit Timetable</h2>

              {schedule.map((dayObj, i) => (
                <div key={i} className="editor-day">
                  <div className="day-header">
                    <h3>{dayObj.day}</h3>
                    {dayObj.slots.length > 0 && (
                      <button
                        className="btn delete"
                        onClick={() => deleteDay(i)}
                      >
                        🗑️ Clear Day
                      </button>
                    )}
                  </div>

                  {dayObj.slots.map((slot, j) => (
                    <div key={j} className="slot-row">
                      <input
                        type="text"
                        placeholder="Time"
                        value={slot.time}
                        onChange={(e) =>
                          updateSlot(i, j, "time", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Subject"
                        value={slot.subject}
                        onChange={(e) =>
                          updateSlot(i, j, "subject", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Topic (optional)"
                        value={slot.topic}
                        onChange={(e) =>
                          updateSlot(i, j, "topic", e.target.value)
                        }
                      />
                      <button
                        className="btn delete small"
                        onClick={() => deleteSlot(i, j)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button className="btn text" onClick={() => addSlot(i)}>
                    + Add Slot
                  </button>
                </div>
              ))}

              <div className="action-buttons">
                <button className="btn success" onClick={saveTimetable}>
                  💾 Save
                </button>
                <button
                  className="btn secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ✅ Right: Live Preview */}
          <div className="preview-pane">
            <h2>📅 Current Schedule</h2>
            <div className="timetable-grid">
              {schedule.map((dayObj, i) => (
                <div key={i} className="day-card">
                  <h3>{dayObj.day}</h3>
                  {dayObj.slots.length > 0 ? (
                    <ul>
                      {dayObj.slots.map((slot, j) => (
                        <li key={j}>
                          <p>
                            <strong>Time:</strong> {slot.time}
                          </p>
                          <p>
                            <strong>Subject:</strong> {slot.subject}
                          </p>
                          {slot.topic && (
                            <p className="topic">
                              <strong>Topic:</strong> {slot.topic}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-day">No classes scheduled</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
