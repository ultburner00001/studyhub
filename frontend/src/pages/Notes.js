// src/pages/Notes.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./Notes.css";

const API = process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api";

export default function Notes() {
  const userId = localStorage.getItem("studyhub_user_id");
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let mounted = true;
    fetch(`${API}/notes/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setNotes(data.notes || data.data || []);
      })
      .catch((err) => {
        console.error("Notes fetch error:", err);
        setNotes([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [userId]);

  const addNote = async () => {
    if (!content.trim()) return;
    const payload = { userId, title: "Note", content };
    try {
      const res = await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) setNotes((prev) => [...prev, data.note]);
      else {
        // fallback local push
        const n = { id: `local-${Date.now()}`, title: "Note", content };
        setNotes((prev) => [...prev, n]);
      }
      setContent("");
    } catch (err) {
      console.error("Save note error:", err);
      const n = { id: `local-${Date.now()}`, title: "Note", content };
      setNotes((prev) => [...prev, n]);
      setContent("");
    }
  };

  const deleteNote = async (note) => {
    if (!note) return;
    if (note._id) {
      try {
        await fetch(`${API}/notes/${note._id}`, { method: "DELETE" });
        setNotes((prev) => prev.filter((n) => n._id !== note._id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    }
  };

  if (!userId) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 20 }}>
          <h2>Notes</h2>
          <p>Please <Link to="/login">login</Link> to view and save notes.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Your Notes</h2>

        <div style={{ marginBottom: 12 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            style={{ width: "100%", height: 90 }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={addNote} className="btn btn-primary">Save Note</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : notes.length === 0 ? (
          <p>No notes yet — create one!</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {notes.map((n) => (
              <li key={n._id || n.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 8, borderRadius: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>{n.title || "Untitled"}</div>
                  <div>
                    <button onClick={() => deleteNote(n)} style={{ marginLeft: 8 }}>Delete</button>
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>{n.content}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
