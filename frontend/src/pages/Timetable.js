import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../api/httpClient';
import './Timetable.css';

function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', time: '', subject: '', topic: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');
  const [notifications, setNotifications] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ✅ Safe fallback (no AuthContext)
  const currentUser = { name: localStorage.getItem('username') || 'Guest' };

  const days = useMemo(() => 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  , []);

  const timeSlots = useMemo(() => [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ], []);

  const autoSaveTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem('studyhub_timetable_backup', JSON.stringify({ schedule, timestamp: Date.now() }));
  }, [schedule]);

  const performAutoSave = useCallback(async () => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    try {
      setSaving(true);
      await httpClient.post('/timetable', { schedule });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showNotification('Timetable saved successfully', 'success');
      saveToLocalStorage();
      localStorage.removeItem('studyhub_timetable_backup');
    } catch (error) {
      console.error('Auto-save error:', error);
      showNotification('Failed to save timetable', 'error');
      saveToLocalStorage();
    } finally {
      setSaving(false);
    }
  }, [schedule, saveToLocalStorage, showNotification]);

  const debounceAutoSave = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => performAutoSave(), 2000);
  }, [performAutoSave]);

  const initializeData = useCallback(async () => {
    const initialSchedule = days.map(day => ({ day, slots: [] }));
    setSchedule(initialSchedule);
    setLoading(true);

    try {
      const saved = localStorage.getItem('studyhub_timetable_backup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schedule && Array.isArray(parsed.schedule)) {
          setSchedule(parsed.schedule);
          setHasUnsavedChanges(true);
          showNotification('Unsaved changes loaded from local storage', 'info');
          return;
        }
      }

      // Try server but don’t crash if unauthorized
      const response = await httpClient.get('/timetable').catch(() => null);
      if (response?.data?.success && Array.isArray(response.data.timetable.schedule)) {
        setSchedule(response.data.timetable.schedule);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error initializing timetable:', error);
      showNotification('Failed to load timetable. Using empty schedule.', 'error');
    } finally {
      setLoading(false);
    }
  }, [days, showNotification]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (hasUnsavedChanges) debounceAutoSave();
  }, [hasUnsavedChanges, debounceAutoSave]);

  // (All your addSlot, updateSlot, deleteSlot, toggleCompletion, getDayCompletion, etc remain unchanged)
  // I’ll keep those functions as-is since they’re working fine.

  // -- Paste all your remaining JSX below unchanged --
  // (No useAuth, no login blocking)

  // 🔽 Replace only top <header> section inside return
  if (loading) {
    return (
      <div className="timetable-page">
        <header className="topbar">
          <div className="brand">
            <span className="logo">📚</span>
            <Link to="/" className="title">StudyHub</Link>
          </div>
          <div className="actions">
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  // keep rest of JSX same, only ensure the greeting line uses currentUser safely:
  // <span className="user-greeting">Hello, {currentUser?.name || "Guest"}</span>
}

export default Timetable;
