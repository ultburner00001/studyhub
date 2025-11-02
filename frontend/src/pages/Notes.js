import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const API_URL =
  (import.meta.env.VITE_API_URL || "https://studyhub-21ux.onrender.com") + "/api";

const httpClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Show toast-like message
  const showMessage = (msg, timeout = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), timeout);
  };

  // ✅ Load all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/notes");
      if (res.data?.success) {
        setNotes(res.data.notes);
      } else {
        showMessage("Failed to load notes");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showMessage("Server connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ✅ Create new note
  const createNote = () => {
    const newNote = {
      id: `local-${Date.now()}`,
      title: "Untitled",
      content: "",
    };
    setNotes((prev) => [newNote, ...prev]);
    setCurrentNote(newNote);
    setContent("");
    setIsEditing(true);
  };

  // ✅ Open existing note
  const openNote = (note) => {
    setCurrentNote(note);
    setContent(note.content || "");
    setIsEditing(true);
  };

  // ✅ Save note (handles both create & update)
  const saveNote = async () => {
    if (!currentNote) return;

    const title = currentNote.title?.trim() || "Untitled";
    const text = content.trim();
    if (!text) {
      showMessage("Note content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = currentNote._id
        ? await httpClient.put(`/notes/${currentNote._id}`, { title, content: text })
        : await httpClient.post("/notes", { title, content: text });

      if (res.data?.success) {
        const saved = res.data.note;
        setNotes((prev) => {
          const updated = prev.filter(
            (n) => n._id !== saved._id && n.id !== currentNote.id
          );
          return [saved, ...updated];
        });
        setCurrentNote(saved);
        setIsEditing(false);
        showMessage("✅ Note saved successfully");
      } else {
        showMessage("Failed to save note");
      }
    } catch (err) {
      console.error("Save error:", err);
      showMessage("Error saving note");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete note
  const deleteNote = async (note) => {
    if (!window.confirm("Delete this note?")) return;
    const id = note._id || note.id;

    try {
      if (note._id) {
        await httpClient.delete(`/notes/${id}`);
      }
      setNotes((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      setCurrentNote(null);
      setIsEditing(false);
      showMessage("🗑️ Note deleted");
    } catch (err) {
      console.error("Delete error:", err);
      showMessage("Error deleting note");
    }
  };

  return (
    <div className="notes-page">
      {message && <div className="toast">{message}</div>}

      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link active">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
      </header>

      <div className="notes-container">
        {/* Sidebar */}
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={createNote}>+ New Note</button>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : notes.length > 0 ? (
            <div className="notes-list">
              {notes.map((n) => (
                <div
                  key={n._id || n.id}
                  className={`note-item ${
                    currentNote && (currentNote._id === n._id || currentNote.id === n.id)
                      ? "active"
                      : ""
                  }`}
                >
                  <div onClick={() => openNote(n)} className="note-main">
                    <div className="note-title">{n.title || "Untitled"}</div>
                    <div className="note-preview">
                      {(n.content || "").slice(0, 80) || "Empty note"}
                    </div>
                  </div>
                  <button className="btn-delete" onClick={() => deleteNote(n)}>🗑️</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No notes yet — create one!</div>
          )}
        </aside>

        {/* Editor */}
        <main className="notes-editor">
          {isEditing && currentNote ? (
            <div className="editor-wrap">
              <input
                className="note-title-input"
                value={currentNote.title}
                onChange={(e) =>
                  setCurrentNote((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Note title"
              />
              <textarea
                key={currentNote._id || currentNote.id}
                className="note-content-textarea"
                placeholder="Start typing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="editor-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentNote(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveNote}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <h3>Select a note or create a new one</h3>
              <button className="btn btn-primary" onClick={createNote}>
                Create Note
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
