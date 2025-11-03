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

// Helper: try to find userId from various places (localStorage keys or JWT)
function getUserIdFromStorage() {
  try {
    // Common JSON user object
    const userKeys = ["studyhub_user", "user", "currentUser"];
    for (const k of userKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed._id || parsed.userId)) {
          return parsed.id || parsed._id || parsed.userId;
        }
      } catch (e) {
        // maybe it's plain id string
        if (raw && raw.length > 8) return raw;
      }
    }

    // Direct user id keys
    const idKeys = ["studyhub_user_id", "userId", "_id"];
    for (const k of idKeys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }

    // Try to decode JWT stored in studyhub_token or token
    const token = localStorage.getItem("studyhub_token") || localStorage.getItem("token");
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          // atob available in browsers
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          // common claims
          return payload.id || payload.sub || payload.userId || null;
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

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
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getUserIdFromStorage();
      if (!userId) {
        notify("Not logged in — set userId in localStorage (studyhub_user_id) to load notes", "warning");
        setNotes([]);
        return;
      }

      const res = await http.get("/notes", { params: { userId } });
      // some backends send { success: true, data: notes } or { success, notes }
      const fetched = res.data?.notes || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(fetched)) {
        setNotes(fetched);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("⚠️ Fetch notes error:", err);
      // show helpful error message for common scenarios
      if (err?.response?.status === 400) {
        notify("Bad request from client — missing or invalid userId (400).", "error");
      } else if (err?.response?.status === 401) {
        notify("Unauthorized — please login", "error");
      } else {
        notify("Could not load notes — check backend or network", "error");
      }
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const newNote = () => {
    const temp = { id: `local-${Date.now()}`, title: "Untitled", content: "" };
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

    const userId = getUserIdFromStorage();
    if (!userId) {
      notify("Can't save: no userId found in localStorage", "error");
      return;
    }

    setSaving(true);
    try {
      let res;
      const payload = { title: title.trim() || "Untitled", content: trimmed, userId };

      if (activeNote._id) {
        res = await http.put(`/notes/${activeNote._id}`, payload);
      } else {
        res = await http.post("/notes", payload);
      }

      if (res.data?.success) {
        notify("✅ Note saved successfully!", "success");
        // refresh list from server to be safe
        await fetchNotes();
        setActiveNote(null);
      } else {
        notify("❌ Could not save note", "error");
      }
    } catch (err) {
      console.error("⚠️ Save error:", err);
      if (err?.response?.status === 400) {
        notify("Bad request when saving (400). Check payload/userId.", "error");
      } else {
        notify("Server error while saving note", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (note) => {
    if (!note) return;
    if (!window.confirm("Delete this note permanently?")) return;

    const userId = getUserIdFromStorage();
    if (!userId) {
      notify("Can't delete: no userId found in localStorage", "error");
      return;
    }

    try {
      if (note._id) {
        const res = await http.delete(`/notes/${note._id}`, { params: { userId } });
        if (res.data?.success) {
          notify("🗑️ Note deleted", "success");
          await fetchNotes();
        } else {
          notify("❌ Failed to delete", "error");
        }
      } else {
        // local only
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        notify("🗑️ Local note deleted", "info");
      }
      setActiveNote(null);
    } catch (err) {
      console.error("⚠️ Delete error:", err);
      notify("Error deleting note", "error");
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
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">Notes</Link>
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

      <div className="notes-container">
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={newNote}>+ New Note</button>
          </div>

          {loading ? (
            <div className="loading">⏳ Loading notes...</div>
          ) : Array.isArray(notes) && notes.length > 0 ? (
            <div className="notes-list">
              {notes.map((n) => (
                <div key={n._id || n.id} className={`note-item ${activeNote && (activeNote._id === n._id || activeNote.id === n.id) ? "active" : ""}`}>
                  <div onClick={() => openNote(n)} className="note-main">
                    <div className="note-title">{n.title || "Untitled"}</div>
                    <div className="note-preview">{previewText(n.content)}</div>
                  </div>
                  <button className="btn-delete" title="Delete" onClick={() => deleteNote(n)}>🗑️</button>
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
              <input type="text" className="note-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
              <textarea className="note-content-textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start typing your note..." />
              <div className="editor-actions">
                <button className="btn btn-outline" onClick={() => setActiveNote(null)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={saveNote} disabled={saving}>{saving ? "💾 Saving..." : "Save Note"}</button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <h3>📝 Select or create a note</h3>
              <button className="btn btn-primary" onClick={newNote}>+ Create New</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
