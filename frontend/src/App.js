import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Courses from "./pages/Courses";
import AskDoubt from "./pages/AskDoubt";
import Timetable from "./pages/Timetable";
import Admin from "./pages/Admin";
import LoginRegister from "./pages/LoginRegister";

function App() {
  useEffect(() => {
    // 🔑 Set default user ID for testing (replace later with real login)
    if (!localStorage.getItem("studyhub_user_id")) {
      localStorage.setItem("studyhub_user_id", "testuser123");
      console.log("✅ Temporary user ID set: testuser123");
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
  <Route path="/login" element={<LoginRegister />} />
  <Route path="/" element={<Home />} />
  <Route path="/notes" element={<Notes />} />
  <Route path="/courses" element={<Courses />} />
  <Route path="/ask-doubt" element={<AskDoubt />} />
  <Route path="/timetable" element={<Timetable />} />
  <Route path="/admin" element={<Admin />} />
</Routes>
      </div>
    </Router>
  );
}

export default App;
