import React, { useEffect, useState, useRef } from "react";
import httpClient from "../api/httpClient";
import { Link } from "react-router-dom";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  // ✅ Load notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await httpClient.get("/notes");
        if (res.data.success) setNotes(res.data.notes);
      } catch (err) {
        console.error("Error loading notes:", err);
      }
    };
    fetchNotes();
  }, []);

  // ✅ Add note
  const addNote = async () => {
    if (!newNote.trim()) return alert("Please enter a note first!");
    try {
      setSaving(true);
      const res = await httpClient.post("/notes", { text: newNote });
      if (res.data.success) {
        setNotes((prev) => [...prev, res.data.note]);
        setNewNote("");
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete note
  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await httpClient.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // ✅ Fix: Avoid null element cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        addNote();
      }
    };

    // only attach if document exists
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleKeyDown);
    }

    // cleanup safely
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [newNote]);

  return (
    <div className="notes-page">
      <header className="topbar">
        <div className="brand">
          <span className="logo">📝</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link active">Notes</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
      </header>

      <div className="notes-container">
        <h1>My Notes</h1>

        <div className="add-note">
          <textarea
            ref={editorRef}
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button
            onClick={addNote}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <p>No notes yet. Add one above!</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="note-item">
                <p>{note.text}</p>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => deleteNote(note._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
