// frontend/src/pages/Notes.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Notes.css';

// Use existing httpClient if you have one, otherwise create a fallback
let httpClient;
try {
  // eslint-disable-next-line import/no-unresolved
  // if you have an httpClient export, keep using it:
  // httpClient = require('../api/httpClient').default;
  // But to avoid runtime errors if it doesn't exist, create axios here:
  throw new Error('force fallback'); // remove if you actually import httpClient
} catch (e) {
  const API_URL = (process.env.REACT_APP_API_URL || 'https://studyhub-21ux.onrender.com') + '/api';
  httpClient = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });
  // attach token automatically if present
  httpClient.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token') || localStorage.getItem('studyhub_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
}

function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null); // will hold server-saved note object
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const editorRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // toast helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(t => t.id !== id)), 4500);
  };

  // online/offline handling
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      showToast('Back online — syncing drafts', 'success');
      // try fetch notes again
      fetchNotes();
      // try saving auto draft if any
      if (currentNote && currentNote._localDraft) {
        // attempt save
        saveNote();
      }
    };
    const onOffline = () => {
      setIsOnline(false);
      showToast('You are offline — drafts saved locally', 'warning');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNote]);

  // fetch notes from backend
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpClient.get('/notes');
      if (res.data && res.data.success) {
        setNotes(res.data.notes || []);
      } else {
        showToast(res.data?.message || 'Failed to load notes', 'error');
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      showToast('Unable to load notes. Check connection.', 'error');
      // fallback to any saved local drafts listing
      const localDrafts = Object.keys(localStorage)
        .filter(k => k.startsWith('note_draft_'))
        .map(k => {
          try {
            const parsed = JSON.parse(localStorage.getItem(k));
            return { _id: parsed._id || `local-${k}`, title: parsed.title || 'Draft', content: parsed.content || '', _local: true, draftKey: k, updatedAt: parsed.lastSaved || new Date().toISOString() };
          } catch (e) { return null; }
        })
        .filter(Boolean);
      if (localDrafts.length) setNotes(localDrafts.concat([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // safe listener attachments for editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onInput = () => {
      // update current note content live
      setCurrentNote(prev => prev ? { ...prev, content: editor.innerHTML } : prev);
      // debounce auto-save to localStorage
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        if (currentNote) {
          const key = `note_draft_${currentNote._id || currentNote.id || 'unsaved'}`;
          try {
            localStorage.setItem(key, JSON.stringify({
              _id: currentNote._id,
              title: currentNote.title || 'Untitled',
              content: editor.innerHTML,
              lastSaved: new Date().toISOString()
            }));
            showToast('Draft saved locally', 'info');
          } catch (e) {
            // Quota or other error
            console.warn('Could not save draft locally', e);
          }
        }
      }, 1200);
    };

    editor.addEventListener('input', onInput);
    editor.addEventListener('paste', onInput);
    editor.addEventListener('cut', onInput);

    return () => {
      // guard removal — editor might be null when cleaning up
      try {
        if (editor && editor.removeEventListener) {
          editor.removeEventListener('input', onInput);
          editor.removeEventListener('paste', onInput);
          editor.removeEventListener('cut', onInput);
        }
      } catch (err) {
        console.warn('Error removing editor listeners', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current, currentNote]);

  // create a new note (local-first)
  const createLocalNote = () => {
    const temp = {
      id: `local-${Date.now()}`,
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _local: true
    };
    setNotes(prev => [temp, ...prev]);
    setCurrentNote(temp);
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = temp.content || '';
      editorRef.current?.focus?.();
    }, 0);
  };

  // Save note (handles create and update)
  const saveNote = async () => {
    if (!currentNote) return;
    const title = (currentNote.title || '').trim();
    const content = currentNote.content || (editorRef.current ? editorRef.current.innerHTML : '');
    if (!title) {
      showToast('Please provide a title for the note', 'warning');
      return;
    }

    // offline fallback: store draft locally
    if (!isOnline) {
      const key = `note_draft_${currentNote._id || currentNote.id || 'unsaved'}`;
      localStorage.setItem(key, JSON.stringify({ _id: currentNote._id, title, content, lastSaved: new Date().toISOString() }));
      showToast('You are offline. Draft saved locally', 'warning');
      setCurrentNote(prev => ({ ...prev, content }));
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      let res;
      // if server id exists (stored as _id), we update, otherwise create
      const isServerNote = !!(currentNote._id && !String(currentNote._id).startsWith('local-'));
      if (isServerNote) {
        res = await httpClient.put(`/notes/${currentNote._id}`, { title, content, tags: currentNote.tags || [] });
      } else {
        // create
        res = await httpClient.post('/notes', { title, content, tags: currentNote.tags || [] });
      }

      if (res.data && res.data.success) {
        const saved = res.data.note || res.data;
        // ensure note has _id
        const finalNote = saved._id ? saved : (res.data.note || saved);
        // merge into list: replace existing local temp if present
        setNotes(prev => {
          // remove local temp copy if it exists
          const withoutLocal = prev.filter(n => !(n.id && n.id === currentNote.id) && !(n._id && n._id === currentNote._id));
          // put updated note at top
          return [finalNote, ...withoutLocal];
        });
        setCurrentNote(finalNote);
        // remove local draft
        try {
          const draftKey = `note_draft_${currentNote._id || currentNote.id || finalNote._id}`;
          localStorage.removeItem(draftKey);
        } catch (e) {}
        showToast('Note saved', 'success');
        setIsEditing(false);
      } else {
        showToast(res.data?.message || 'Failed to save note', 'error');
      }
    } catch (err) {
      console.error('Save note error', err);
      showToast('Error saving note. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (note) => {
    if (!note) return;
    const id = note._id || note.id;
    if (!window.confirm('Delete this note?')) return;

    // if local-only (never saved to server), remove locally
    if (!note._id) {
      setNotes(prev => prev.filter(n => n.id !== note.id));
      localStorage.removeItem(`note_draft_${note.id}`);
      if (currentNote && (currentNote.id === note.id || currentNote._id === note._id)) {
        setCurrentNote(null);
        setIsEditing(false);
      }
      showToast('Note removed', 'info');
      return;
    }

    setDeleting(true);
    try {
      const res = await httpClient.delete(`/notes/${id}`);
      if (res.data && res.data.success) {
        setNotes(prev => prev.filter(n => !(n._id === id)));
        if (currentNote && currentNote._id === id) {
          setCurrentNote(null);
          setIsEditing(false);
        }
        showToast('Note deleted', 'success');
      } else {
        showToast(res.data?.message || 'Could not delete note', 'error');
      }
    } catch (err) {
      console.error('Delete note error', err);
      showToast('Failed to delete note', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // open note for editing
  const openNote = (note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        // if there's a saved local draft for this note, load it into editor
        const draftKey = `note_draft_${note._id || note.id || 'unsaved'}`;
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            editorRef.current.innerHTML = parsed.content || note.content || '';
            setCurrentNote(prev => ({ ...note, content: parsed.content }));
          } catch (e) {
            editorRef.current.innerHTML = note.content || '';
          }
        } else {
          editorRef.current.innerHTML = note.content || '';
        }
        editorRef.current.focus();
      }
    }, 0);
  };

  // helper to show plain preview text
  const previewText = (html) => {
    if (!html) return 'No content';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  };

  return (
    <div className="notes-page">
      <div className="toast-container">
        {notifications.map(n => (
          <div key={n.id} className={`toast ${n.type}`}>{n.message}</div>
        ))}
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <a href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD" target="_blank" rel="noopener noreferrer" className="nav-link">PYQs</a>
          <Link to="/ask-doubt" className="nav-link">AskDoubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </header>

      <div className="notes-container">
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <div>
              <button className="btn btn-primary" onClick={createLocalNote} disabled={saving}>+ New Note</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading notes...</div>
          ) : (
            <div className="notes-list">
              {notes.map(n => (
                <div key={n._id || n.id} className={`note-item ${currentNote && (currentNote._id === n._id || currentNote.id === n.id) ? 'active' : ''}`}>
                  <div className="note-main" onClick={() => openNote(n)}>
                    <div className="note-title">{n.title || 'Untitled'}</div>
                    <div className="note-preview">{previewText(n.content)}</div>
                  </div>
                  <div className="note-actions">
                    <button className="btn-delete" onClick={() => deleteNote(n)} disabled={deleting}>🗑️</button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <div className="empty">No notes yet — create one!</div>}
            </div>
          )}
        </aside>

        <main className="notes-editor">
          {isEditing && currentNote ? (
            <div className="editor-wrap">
              <input
                className="note-title-input"
                value={currentNote.title || ''}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title"
                disabled={saving}
              />

              <div
                ref={editorRef}
                className="note-content-editor"
                contentEditable={!saving}
                suppressContentEditableWarning={true}
                style={{ minHeight: 300 }}
              >
                {/* initial content inserted when note is opened */}
              </div>

              <div className="editor-actions">
                <button className="btn btn-outline" onClick={() => { setIsEditing(false); setCurrentNote(null); }} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={saveNote} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <h3>Select a note or create a new one</h3>
              <p>Rich text editor with local drafts and auto-save.</p>
              <button className="btn btn-primary" onClick={createLocalNote}>Create Your First Note</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Notes;

