import React, { useState, useEffect } from "react";
import "./Timetable.css";

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newSchedule, setNewSchedule] = useState([]);

  // ✅ Fetch timetable from backend
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://studyhub-21ux.onrender.com/api/timetable");
      const data = await res.json();
      if (data.success && data.timetable.length > 0) {
        setTimetable(data.timetable[0].schedule);
      } else {
        setTimetable([]);
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

  // ✅ Add new day
  const addDay = () => {
    setNewSchedule([
      ...newSchedule,
      { day: "", slots: [{ time: "", subject: "", topic: "" }] },
    ]);
  };

  // ✅ Add slot to a day
  const addSlot = (i) => {
    const updated = [...newSchedule];
    updated[i].slots.push({ time: "", subject: "", topic: "" });
    setNewSchedule(updated);
  };

  // ✅ Update slot value
  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...newSchedule];
    updated[dayIndex].slots[slotIndex][field] = value;
    setNewSchedule(updated);
  };

  // ✅ Save to backend
  const saveTimetable = async () => {
    try {
      const res = await fetch("https://studyhub-21ux.onrender.com/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: newSchedule }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Timetable saved successfully!");
        fetchTimetable();
        setEditing(false);
        setNewSchedule([]);
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
            Add / Edit
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
              {newSchedule.map((dayObj, i) => (
                <div key={i} className="editor-day">
                  <input
                    type="text"
                    placeholder="Day (e.g. Monday)"
                    value={dayObj.day}
                    onChange={(e) => {
                      const updated = [...newSchedule];
                      updated[i].day = e.target.value;
                      setNewSchedule(updated);
                    }}
                  />
                  {dayObj.slots.map((slot, j) => (
                    <div key={j} className="slot-row">
                      <input
                        type="text"
                        placeholder="Time"
                        value={slot.time}
                        onChange={(e) => updateSlot(i, j, "time", e.target.value)}
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
                    </div>
                  ))}
                  <button className="btn text" onClick={() => addSlot(i)}>
                    + Add Slot
                  </button>
                </div>
              ))}

              <div className="action-buttons">
                <button className="btn primary" onClick={addDay}>
                  + Add Day
                </button>
                <button className="btn success" onClick={saveTimetable}>
                  Save
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setEditing(false);
                    setNewSchedule([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ✅ Right: Live Preview */}
          <div className="preview-pane">
            <h2>📅 Current Schedule</h2>
            {timetable.length > 0 ? (
              <div className="timetable-grid">
                {timetable.map((dayObj, i) => (
                  <div key={i} className="day-card">
                    <h3>{dayObj.day}</h3>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No timetable added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
