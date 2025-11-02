import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

const API_URL =
  (import.meta.env.VITE_API_URL || "https://studyhub-21ux.onrender.com") + "/api";

const httpClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setNotifications((p) => [...p, { id, msg, type }]);
    setTimeout(() => setNotifications((p) => p.filter((t) => t.id !== id)), 4000);
  };

  // ✅ Load notes from backend
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/notes");
      if (res.data?.success) setNotes(res.data.notes || []);
      else showToast(res.data?.message || "Failed to load notes", "error");
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Could not connect to server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = () => {
    const temp = {
      id: `local-${Date.now()}`,
      title: "Untitled",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setNotes((p) => [temp, ...p]);
    setCurrentNote(temp);
    setIsEditing(true);
    setContent("");
  };

  const openNote = (note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setContent(note.content || "");
  };

  const saveNote = async () => {
    if (!currentNote) return;
    const title = currentNote.title?.trim() || "Untitled";
    const trimmed = content.trim();
    if (!trimmed) {
      showToast("Note content cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = currentNote._id
        ? await httpClient.put(`/notes/${currentNote._id}`, { title, content: trimmed })
        : await httpClient.post("/notes", { title, content: trimmed });

      if (res.data?.success) {
        const saved = res.data.note;
        setNotes((prev) => {
          const others = prev.filter(
            (n) => n._id !== saved._id && n.id !== currentNote.id
          );
          return [saved, ...others];
        });
        setCurrentNote(saved);
        setIsEditing(false);
        showToast("✅ Note saved successfully", "success");
      } else {
        showToast(res.data?.message || "Failed to save note", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("Error saving note", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (note) => {
    if (!note) return;
    const id = note._id || note.id;
    if (!window.confirm("Delete this note?")) return;

    if (!note._id) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
        setIsEditing(false);
      }
      showToast("🗑️ Local note deleted", "info");
      return;
    }

    try {
      const res = await httpClient.delete(`/notes/${id}`);
      if (res.data?.success) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        if (currentNote?._id === id) {
          setCurrentNote(null);
          setIsEditing(false);
        }
        showToast("🗑️ Note deleted successfully", "success");
      } else {
        showToast(res.data?.message || "Failed to delete note", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Error deleting note", "error");
    }
  };

  const preview = (text) => {
    const clean = text?.replace(/<[^>]+>/g, "") || "";
    return clean.length > 80 ? clean.slice(0, 80) + "..." : clean || "Empty note";
  };

  // ✅ Prevent crash: ensure ref cleanup safely
  useEffect(() => {
    const el = editorRef.current;
    return () => {
      if (el) {
        el.removeEventListener?.("input", () => {});
      }
    };
  }, []);

  return (
    <div className="notes-page">
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast ${n.type}`}>
            {n.msg}
          </div>
        ))}
      </div>

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
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={createNote}>+ New Note</button>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="notes-list">
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div
                    key={n._id || n.id}
                    className={`note-item ${
                      currentNote &&
                      (currentNote._id === n._id || currentNote.id === n.id)
                        ? "active"
                        : ""
                    }`}
                  >
                    <div onClick={() => openNote(n)} className="note-main">
                      <div className="note-title">{n.title || "Untitled"}</div>
                      <div className="note-preview">{preview(n.content)}</div>
                    </div>
                    <button className="btn-delete" onClick={() => deleteNote(n)}>🗑️</button>
                  </div>
                ))
              ) : (
                <div className="empty">No notes yet — create one!</div>
              )}
            </div>
          )}
        </aside>

        <main className="notes-editor">
          {isEditing && currentNote ? (
            <div className="editor-wrap">
              <input
                className="note-title-input"
                value={currentNote.title}
                onChange={(e) =>
                  setCurrentNote((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Note title"
              />
              <textarea
                ref={editorRef}
                className="note-content-textarea"
                placeholder="Start typing your note..."
                value={content}
                dir="ltr"
                style={{ textAlign: "left" }}
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
              <p>Your notes will autosave locally and sync online.</p>
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
