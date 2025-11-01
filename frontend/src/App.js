import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Notes from './pages/Notes';
import Courses from './pages/Courses';
import AskDoubt from './pages/AskDoubt';
import Timetable from './pages/Timetable';
import Admin from './pages/Admin';
import Auth from './pages/Auth'; // optional login/register page

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🏠 Home opens directly */}
          <Route path="/" element={<Home />} />

          {/* 📘 All sections open freely */}
          <Route path="/notes" element={<Notes />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/ask-doubt" element={<AskDoubt />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/admin" element={<Admin />} />

          {/* 🔑 Optional login/register */}
          <Route path="/auth" element={<Auth />} />

          {/* 🧭 Fallback route */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Page not found</h2>
                <Link to="/" className="btn btn-primary">Go Home</Link>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

