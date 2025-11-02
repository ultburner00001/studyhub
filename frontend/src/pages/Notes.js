import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notes.css";
import { Link } from "react-router-dom";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const API_URL = "https://studyhub-21ux.onrender.com/api/notes";

  // ✅ Fetch Notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setNotes(res.data);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Note
  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    try {
      const res = await axios.post(API_URL, newNote);
      setNotes([...notes, res.data]);
      setNewNote({ title: "", content: "" });
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // ✅ Delete Note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // ✅ Update Note
  const updateNote = async () => {
    try {
      const res = await axios.put(`${API_URL}/${editingNote._id}`, editingNote);
      setNotes(notes.map((n) => (n._id === editingNote._id ? res.data : n)));
      setEditingNote(null);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  return (
    <div className="notes-container">
      {/* ✅ Top Navbar (Same as Timetable.js) */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link active">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <a
            href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            PYQs
          </a>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">🏠 Home</Link>
        </div>
      </header>

      {/* ✅ Notes Section */}
      <div className="notes-wrapper">
        <div className="notes-header">
          <h1>📝 My Notes</h1>
        </div>

        <div className="note-input">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          <button className="btn primary" onClick={addNote}>
            ➕ Add Note
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : (
          <div className="notes-grid">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div className="note-card" key={note._id}>
                  {editingNote && editingNote._id === note._id ? (
                    <>
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) =>
                          setEditingNote({ ...editingNote, title: e.target.value })
                        }
                      />
                      <textarea
                        value={editingNote.content}
                        onChange={(e) =>
                          setEditingNote({ ...editingNote, content: e.target.value })
                        }
                      />
                      <button className="btn success" onClick={updateNote}>
                        💾 Save
                      </button>
                      <button
                        className="btn secondary"
                        onClick={() => setEditingNote(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>{note.title}</h3>
                      <p>{note.content}</p>
                      <div className="note-actions">
                        <button
                          className="btn edit"
                          onClick={() => setEditingNote(note)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn delete"
                          onClick={() => deleteNote(note._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="no-notes">No notes yet. Add one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
