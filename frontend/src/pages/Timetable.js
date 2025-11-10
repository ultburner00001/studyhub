// src/pages/Timetable.js
import React, { useEffect, useState } from "react";

/**
 * Minimal Timetable page that stores/loads per-user timetable from localStorage.
 * Keys timetable by `timetable_{userId}` where userId is read from localStorage key "studyhub_user_id".
 * Copy-paste this file to replace the existing src/pages/Timetable.js
 */

const getStorageKey = (userId) => `timetable_${userId || "anon"}`;

export default function Timetable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const userId = localStorage.getItem("studyhub_user_id");
        const key = getStorageKey(userId);
        const raw = localStorage.getItem(key);
        setItems(raw ? JSON.parse(raw) : []);
      } catch (err) {
        console.error("Failed to load timetable:", err);
        setItems([]);
      }
    }

    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty - fetchTimetable is declared inside effect

  function saveItems(newItems) {
    setItems(newItems);
    const userId = localStorage.getItem("studyhub_user_id");
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(newItems));
  }

  function addRow() {
    const newRow = { id: `tt_${Date.now()}`, day: "Monday", start: "09:00", end: "10:00", title: "" };
    saveItems([...items, newRow]);
  }

  function updateRow(idx, field, value) {
    const copy = items.slice();
    copy[idx] = { ...copy[idx], [field]: value };
    saveItems(copy);
  }

  function deleteRow(idx) {
    const copy = items.filter((_, i) => i !== idx);
    saveItems(copy);
  }

  const userId = localStorage.getItem("studyhub_user_id");
  if (!userId) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Timetable</h2>
        <p>Please login to see your timetable.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>Your Timetable</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={addRow}>Add Row</button>
        <button onClick={() => saveItems(items)} style={{ marginLeft: 8 }}>
          Save
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Day</th>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Start</th>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>End</th>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Title</th>
            <th style={{ borderBottom: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 12 }}>
                No timetable rows yet.
              </td>
            </tr>
          )}
          {items.map((it, idx) => (
            <tr key={it.id}>
              <td style={{ padding: 8 }}>
                <input value={it.day} onChange={(e) => updateRow(idx, "day", e.target.value)} />
              </td>
              <td style={{ padding: 8 }}>
                <input value={it.start} onChange={(e) => updateRow(idx, "start", e.target.value)} />
              </td>
              <td style={{ padding: 8 }}>
                <input value={it.end} onChange={(e) => updateRow(idx, "end", e.target.value)} />
              </td>
              <td style={{ padding: 8 }}>
                <input value={it.title} onChange={(e) => updateRow(idx, "title", e.target.value)} />
              </td>
              <td style={{ padding: 8 }}>
                <button onClick={() => deleteRow(idx)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
