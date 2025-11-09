import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const register = (payload) => axios.post(`${API_BASE}/auth/register`, payload);
export const login = (payload) => axios.post(`${API_BASE}/auth/login`, payload);

export const getTimetable = () => axios.get(`${API_BASE}/timetable`, { headers: authHeader() });
export const saveTimetable = (items) => axios.put(`${API_BASE}/timetable`, { items }, { headers: authHeader() });

export const getNotes = () => axios.get(`${API_BASE}/notes`, { headers: authHeader() });
export const createNote = (note) => axios.post(`${API_BASE}/notes`, note, { headers: authHeader() });
export const updateNote = (id, note) => axios.put(`${API_BASE}/notes/${id}`, note, { headers: authHeader() });
export const deleteNote = (id) => axios.delete(`${API_BASE}/notes/${id}`, { headers: authHeader() });
