import React, { useEffect, useState } from "react";

const API = "https://studyhub-21ux.onrender.com/api";

export default function Timetable() {
  const userId = localStorage.getItem("studyhub_user_id");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch(`${API}/timetable/${userId}`)
      .then((r) => r.json())
      .then((d) => d.timetable && setRows(d.timetable));
  }, [userId]);

  const addRow = async () => {
    const newRow = { day: "Mon", start: "9:00", end: "10:00", title: "Subject" };
    const res = await fetch(`${API}/timetable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRow, userId }),
    });
    const data = await res.json();
    if (data.success) setRows([...rows, data.row]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Timetable</h2>
      <button onClick={addRow}>+ Add Class</button>
      <ul>
        {rows.map((r, i) => (
          <li key={i}>
            {r.day} {r.start}-{r.end}: {r.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
