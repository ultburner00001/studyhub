import React, { useEffect, useState } from "react";

const API = "https://your-backend.onrender.com/api";

export default function Notes() {
  const userId = localStorage.getItem("studyhub_user_id");
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`${API}/notes/${userId}`)
      .then((r) => r.json())
      .then((d) => d.notes && setNotes(d.notes));
  }, [userId]);

  const addNote = async () => {
    const res = await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title: "Note", content }),
    });
    const data = await res.json();
    if (data.success) setNotes([...notes, data.note]);
    setContent("");
  };

  const deleteNote = async (id) => {
    await fetch(`${API}/notes/${id}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n._id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Notes</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
      />
      <br />
      <button onClick={addNote}>Save Note</button>
      <ul>
        {notes.map((n) => (
          <li key={n._id}>
            {n.content}{" "}
            <button onClick={() => deleteNote(n._id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
