// src/pages/Timetable.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api";

export default function Timetable() {
  const userId = localStorage.getItem("studyhub_user_id");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let mounted = true;
    fetch(`${API}/timetable/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setRows(data.timetable || data || []);
      })
      .catch((err) => {
        console.error("Timetable fetch error:", err);
        setRows([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [userId]);

  const addRow = async () => {
    const day = prompt("Day (e.g. Monday):", "Monday");
    if (!day) return;
    const title = prompt("Subject title:", "Subject");
    if (!title) return;
    const start = prompt("Start time (e.g. 09:00):", "09:00");
    const end = prompt("End time (e.g. 10:00):", "10:00");
    const payload = { userId, day, start, end, title };
    try {
      const res = await fetch(`${API}/timetable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) setRows((prev) => [...prev, data.row]);
      else setRows((prev) => [...prev, { id: `local-${Date.now()}`, ...payload }]);
    } catch (err) {
      console.error("Add row error:", err);
      setRows((prev) => [...prev, { id: `local-${Date.now()}`, ...payload }]);
    }
  };

  if (!userId) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 20 }}>
          <h2>Timetable</h2>
          <p>Please <Link to="/login">login</Link> to view your timetable.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Your Timetable</h2>
        <div style={{ marginBottom: 12 }}>
          <button onClick={addRow} className="btn btn-primary">+ Add Class</button>
        </div>

        {loading ? <p>Loading...</p> : rows.length === 0 ? (
          <p>No classes yet</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Day</th>
                <th style={th}>Start</th>
                <th style={th}>End</th>
                <th style={th}>Title</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id || r.id}>
                  <td style={td}>{r.day}</td>
                  <td style={td}>{r.start}</td>
                  <td style={td}>{r.end}</td>
                  <td style={td}>{r.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const th = { borderBottom: "1px solid #eee", padding: 8, textAlign: "left" };
const td = { padding: 8, borderBottom: "1px solid #fafafa" };
