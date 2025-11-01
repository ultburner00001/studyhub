import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: null, title: "", content: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const editorRef = useRef(null);

  // ✅ Toasts
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  };

  const dismissToast = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ✅ Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("guest_notes") || "[]");
    setNotes(savedNotes);
  }, []);

  // ✅ Save to localStorage
  const saveToLocal = (updatedNotes) => {
    localStorage.setItem("guest_notes", JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveToLocal(updated);
    setCurrentNote(newNote);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim()) {
      showToast("Note title cannot be empty", "warning");
      return;
    }

    const updatedNotes = notes.map((n) =>
      n.id === currentNote.id ? { ...currentNote, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    saveToLocal(updatedNotes);
    showToast("Note saved locally!", "success");
    setIsEditing(false);
  };

  const handleDeleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveToLocal(updated);
    setCurrentNote({ id: null, title: "", content: "" });
    setIsEditing(false);
    showToast("Note deleted", "info");
  };

  const handleFormatText = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, null);
    setCurrentNote((prev) => ({ ...prev, content: editorRef.current.innerHTML }));
  };

  const handleEditorChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setCurrentNote((prev) => ({ ...prev, content: newContent }));
    }
  }, []);

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = currentNote.content || "";
      editorRef.current.addEventListener("input", handleEditorChange);
      return () => editorRef.current.removeEventListener("input", handleEditorChange);
    }
  }, [isEditing, currentNote, handleEditorChange]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  const getPreviewText = (html) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > 50 ? text.slice(0, 50) + "..." : text || "Empty note";
  };

  return (
    <div className="notes-page">
      {/* Toasts */}
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            <span>{n.message}</span>
            <button className="toast-close" onClick={() => dismissToast(n.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
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
        {/* Sidebar */}
        <div className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn btn-primary" onClick={handleCreateNote}>
              + New Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>No notes yet.</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`note-item ${currentNote.id === note.id ? "active" : ""}`}
                  onClick={() => {
                    setCurrentNote(note);
                    setIsEditing(true);
                  }}
                >
                  <div className="note-header">
                    <div className="note-title">{note.title}</div>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="note-preview">{getPreviewText(note.content)}</div>
                  <div className="note-date">{formatDate(note.updatedAt || note.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="notes-editor">
          {isEditing ? (
            <div className="editor-container">
              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <label>Font Size: </label>
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      if (editorRef.current)
                        editorRef.current.style.fontSize = e.target.value;
                    }}
                    className="toolbar-select"
                  >
                    <option value="14px">Small</option>
                    <option value="16px">Medium</option>
                    <option value="18px">Large</option>
                  </select>
                </div>

                <div className="toolbar-group">
                  <button onClick={() => handleFormatText("bold")} className="toolbar-btn">
                    <b>B</b>
                  </button>
                  <button onClick={() => handleFormatText("italic")} className="toolbar-btn">
                    <i>I</i>
                  </button>
                  <button onClick={() => handleFormatText("underline")} className="toolbar-btn">
                    <u>U</u>
                  </button>
                </div>

                <div className="toolbar-actions">
                  <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveNote} disabled={saving}>
                    {saving ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={currentNote.title}
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                className="note-title-input"
                placeholder="Note Title"
              />

              <div
                ref={editorRef}
                className="note-content-editor"
                contentEditable
                style={{ fontSize }}
              ></div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <h3>Select or create a note</h3>
              <button className="btn btn-primary" onClick={handleCreateNote}>
                Create New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
