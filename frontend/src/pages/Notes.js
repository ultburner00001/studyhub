import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";


const API_URL = process.env.REACT_APP_API_URL || "https://studyhub-21ux.onrender.com/api";



const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Show small message box for feedback
  const notify = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ✅ Load notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get("/notes");
      if (res.data?.success) setNotes(res.data.notes);
      else notify("Failed to load notes", "error");
    } catch (err) {
      console.error(err);
      notify("Server error while fetching notes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ✅ Create a new note
  const newNote = () => {
    const temp = {
      id: `local-${Date.now()}`,
      title: "Untitled Note",
      content: "",
    };
    setNotes((prev) => [temp, ...prev]);
    setActiveNote(temp);
    setTitle(temp.title);
    setContent("");
  };

  // ✅ Open an existing note
  const openNote = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  // ✅ Save or update note
  const saveNote = async () => {
    if (!activeNote) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      notify("Note content cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (activeNote._id) {
        res = await http.put(`/notes/${activeNote._id}`, {
          title: title.trim() || "Untitled",
          content: trimmedContent,
        });
      } else {
        res = await http.post("/notes", {
          title: title.trim() || "Untitled",
          content: trimmedContent,
        });
      }

      if (res.data?.success) {
        const savedNote = res.data.note;
        setNotes((prev) => {
          const filtered = prev.filter(
            (n) => n._id !== savedNote._id && n.id !== activeNote.id
          );
          return [savedNote, ...filtered];
        });
        setActiveNote(savedNote);
        notify("✅ Note saved successfully", "success");
      } else {
        notify("Failed to save note", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error saving note", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete note
  const deleteNote = async (note) => {
    if (!note) return;
    if (!window.confirm("Delete this note?")) return;

    // Local note deletion
    if (!note._id) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      if (activeNote?.id === note.id) {
        setActiveNote(null);
      }
      notify("🗑️ Local note deleted", "info");
      return;
    }

    // Backend note deletion
    try {
      const res = await http.delete(`/notes/${note._id}`);
      if (res.data?.success) {
        setNotes((prev) => prev.filter((n) => n._id !== note._id));
        if (activeNote?._id === note._id) setActiveNote(null);
        notify("🗑️ Note deleted", "success");
      } else notify("Failed to delete note", "error");
    } catch (err) {
      console.error(err);
      notify("Server error deleting note", "error");
    }
  };

  // ✅ Preview for sidebar
  const previewText = (txt) => {
    const clean = txt?.replace(/<[^>]+>/g, "") || "";
    return clean.length > 60 ? clean.slice(0, 60) + "..." : clean || "Empty note";
  };

  return (
    <div className="notes-page">
      {/* Toast / Message */}
      {message && (
        <div className={`toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">📘</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link active">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <Link to="/ask-doubt" className="nav-link">Ask Doubt</Link>
        </nav>
      </header>

      {/* Main Layout */}
      <div className="notes-container">
        {/* Sidebar */}
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={newNote}>+ New Note</button>
          </div>

          {loading ? (
            <div className="loading">Loading notes...</div>
          ) : notes.length > 0 ? (
            <div className="notes-list">
              {notes.map((n) => (
                <div
                  key={n._id || n.id}
                  className={`note-item ${
                    activeNote && (activeNote._id === n._id || activeNote.id === n.id)
                      ? "active"
                      : ""
                  }`}
                >
                  <div onClick={() => openNote(n)} className="note-main">
                    <div className="note-title">{n.title}</div>
                    <div className="note-preview">{previewText(n.content)}</div>
                  </div>
                  <button className="btn-delete" onClick={() => deleteNote(n)}>🗑️</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No notes found. Create one!</div>
          )}
        </aside>

        {/* Editor */}
        <main className="notes-editor">
          {activeNote ? (
            <div className="editor-wrap">
              <input
                type="text"
                className="note-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
              <textarea
                className="note-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your note..."
              />
              <div className="editor-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveNote(null)}
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
              <h3>Select or create a note</h3>
              <button className="btn btn-primary" onClick={newNote}>
                Create Note
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
