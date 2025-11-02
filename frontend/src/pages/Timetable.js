import React, { useState, useEffect } from "react";

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newSchedule, setNewSchedule] = useState([]);

  // ✅ Fetch Timetable
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

  // ✅ Handle Adding a Day
  const addDay = () => {
    setNewSchedule([
      ...newSchedule,
      { day: "", slots: [{ time: "", subject: "", topic: "" }] },
    ]);
  };

  // ✅ Handle Slot Change
  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...newSchedule];
    updated[dayIndex].slots[slotIndex][field] = value;
    setNewSchedule(updated);
  };

  // ✅ Handle Save
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white px-4 sm:px-10 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            🗓️ Study Timetable
          </h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all"
            >
              Add / Edit Timetable
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-10 text-gray-600 text-lg">Loading...</div>
        ) : (
          <>
            {/* View Mode */}
            {!editing && (
              <div className="grid md:grid-cols-2 gap-6">
                {timetable.length > 0 ? (
                  timetable.map((dayObj, i) => (
                    <div
                      key={i}
                      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all border border-gray-100"
                    >
                      <h2 className="text-xl font-semibold text-indigo-700 mb-3">
                        {dayObj.day}
                      </h2>
                      {dayObj.slots.length > 0 ? (
                        <ul className="space-y-2">
                          {dayObj.slots.map((slot, j) => (
                            <li
                              key={j}
                              className="bg-indigo-50 p-3 rounded-xl border border-indigo-100"
                            >
                              <p className="text-gray-800">
                                <strong>Time:</strong> {slot.time}
                              </p>
                              <p className="text-gray-700">
                                <strong>Subject:</strong> {slot.subject}
                              </p>
                              {slot.topic && (
                                <p className="text-gray-600 text-sm">
                                  <strong>Topic:</strong> {slot.topic}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No slots added yet.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No timetable added yet.</p>
                )}
              </div>
            )}

            {/* Edit Mode */}
            {editing && (
              <div className="space-y-6">
                {newSchedule.map((dayObj, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md"
                  >
                    <input
                      type="text"
                      placeholder="Day (e.g. Monday)"
                      value={dayObj.day}
                      onChange={(e) => {
                        const updated = [...newSchedule];
                        updated[i].day = e.target.value;
                        setNewSchedule(updated);
                      }}
                      className="w-full p-3 border rounded-xl mb-4"
                    />
                    {dayObj.slots.map((slot, j) => (
                      <div
                        key={j}
                        className="grid sm:grid-cols-3 gap-3 mb-3 border-b pb-3"
                      >
                        <input
                          type="text"
                          placeholder="Time"
                          value={slot.time}
                          onChange={(e) =>
                            updateSlot(i, j, "time", e.target.value)
                          }
                          className="p-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Subject"
                          value={slot.subject}
                          onChange={(e) =>
                            updateSlot(i, j, "subject", e.target.value)
                          }
                          className="p-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Topic (optional)"
                          value={slot.topic}
                          onChange={(e) =>
                            updateSlot(i, j, "topic", e.target.value)
                          }
                          className="p-2 border rounded-lg"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...newSchedule];
                        updated[i].slots.push({
                          time: "",
                          subject: "",
                          topic: "",
                        });
                        setNewSchedule(updated);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                    >
                      + Add Slot
                    </button>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    onClick={addDay}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700"
                  >
                    + Add Day
                  </button>
                  <button
                    onClick={saveTimetable}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700"
                  >
                    Save Timetable
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setNewSchedule([]);
                    }}
                    className="bg-gray-300 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timetable;
