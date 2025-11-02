import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://studyhub-21ux.onrender.com/api";

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

  const notify = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 2500);
  };

  // ✅ Fetch Notes - handles multiple possible backend formats
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get("/notes");
      let fetchedNotes = [];

      if (Array.isArray(res.data)) {
        fetchedNotes = res.data;
      } else if (Array.isArray(res.data.notes)) {
        fetchedNotes = res.data.notes;
      } else if (Array.isArray(res.data.data)) {
        fetchedNotes = res.data.data;
      }

      if (Array.isArray(fetchedNotes)) {
        setNotes(fetchedNotes.filter((n) => n && typeof n === "object"));
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("Fetch notes error:", err);
      notify("⚠️ Error loading notes", "error");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const newNote = () => {
    const temp = {
      id: `local-${Date.now()}`,
      title: "Untitled Note",
      content: "",
    };
    setNotes((prev) => [temp, ...(Array.isArray(prev) ? prev : [])]);
    setActiveNote(temp);
    setTitle(temp.title);
    setContent("");
  };

  const openNote = (note) => {
    if (!note) return;
    setActiveNote(note);
    setTitle(note.title || "");
    setContent(note.content || "");
  };

  const saveNote = async () => {
    if (!activeNote) return;
    const trimmed = content.trim();
    if (!trimmed) return notify("✏️ Write something before saving!", "warning");

    setSaving(true);
    try {
      let res;
      if (activeNote._id) {
        res = await http.put(`/notes/${activeNote._id}`, {
          title: title.trim() || "Untitled",
          content: trimmed,
        });
      } else {
        res = await http.post("/notes", {
          title: title.trim() || "Untitled",
          content: trimmed,
        });
      }

      const saved = res.data?.note || res.data?.data || res.data;
      if (saved && typeof saved === "object") {
        setNotes((prev = []) => {
          const arr = Array.isArray(prev) ? prev : [];
          const filtered = arr.filter(
            (n) => n && n._id !== saved?._id && n.id !== activeNote?.id
          );
          return [saved, ...filtered];
        });
        setActiveNote(saved);
        notify("✅ Note saved successfully!", "success");
      } else {
        notify("❌ Could not save note", "error");
      }
    } catch (err) {
      console.error("Save note error:", err);
      notify("⚠️ Server error while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (note) => {
    if (!note) return;
    if (!window.confirm("Delete this note permanently?")) return;

    if (!note._id) {
      setNotes((prev) =>
        (Array.isArray(prev) ? prev : []).filter((n) => n.id !== note.id)
      );
      if (activeNote?.id === note.id) setActiveNote(null);
      return notify("🗑️ Local note deleted", "info");
    }

    try {
      const res = await http.delete(`/notes/${note._id}`);
      if (res.data?.success) {
        setNotes((prev) =>
          (Array.isArray(prev) ? prev : []).filter((n) => n._id !== note._id)
        );
        if (activeNote?._id === note._id) setActiveNote(null);
        notify("🗑️ Note deleted", "success");
      } else notify("❌ Failed to delete", "error");
    } catch (err) {
      console.error("Delete note error:", err);
      notify("⚠️ Error deleting note", "error");
    }
  };

  const previewText = (txt) => {
    const clean = txt?.replace(/<[^>]+>/g, "") || "";
    return clean.length > 60 ? clean.slice(0, 60) + "..." : clean || "Empty note";
  };

  return (
    <div className="notes-page">
      {message && <div className={`toast ${message.type}`}>{message.text}</div>}

      <header className="topbar">
        <div className="brand">
          <span className="logo">📘</span>
          <Link to="/" className="title">
            StudyHub
          </Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link active">
            Notes
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          <Link to="/timetable" className="nav-link">
            Timetable
          </Link>
          <Link to="/ask-doubt" className="nav-link">
            Ask Doubt
          </Link>
        </nav>
      </header>

      <div className="notes-container">
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={newNote}>
              + New Note
            </button>
          </div>

          {loading ? (
            <div className="loading">⏳ Loading notes...</div>
          ) : Array.isArray(notes) && notes.length > 0 ? (
            <div className="notes-list">
              {notes
                .filter((n) => n && (n.title || n.content))
                .map((n) => (
                  <div
                    key={n._id || n.id}
                    className={`note-item ${
                      activeNote &&
                      (activeNote._id === n._id || activeNote.id === n.id)
                        ? "active"
                        : ""
                    }`}
                  >
                    <div onClick={() => openNote(n)} className="note-main">
                      <div className="note-title">{n.title || "Untitled"}</div>
                      <div className="note-preview">
                        {previewText(n.content)}
                      </div>
                    </div>
                    <button
                      className="btn-delete"
                      title="Delete"
                      onClick={() => deleteNote(n)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty">📭 No notes yet. Create one!</div>
          )}
        </aside>

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
                  {saving ? "💾 Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <h3>📝 Select or create a note</h3>
              <button className="btn btn-primary" onClick={newNote}>
                + Create New
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
