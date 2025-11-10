// src/pages/Courses.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Courses.css";

const API = process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple backend fetch: expects /courses to return { success:true, courses: [...] }
  useEffect(() => {
    let mounted = true;
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.success && Array.isArray(data.courses)) setCourses(data.courses);
        else if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {
        // fallback sample list if backend not present
        setCourses([
          { id: 1, title: "Intro to Python", level: "Beginner", link: "https://www.youtube.com/watch?v=nLRL_NcnK-4" },
          { id: 2, title: "Web Development", level: "Intermediate", link: "https://www.youtube.com/watch?v=nu_pCVPKzTk" },
        ]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Courses</h2>
        {loading ? <p>Loading courses...</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {courses.map((c) => (
              <div key={c.id || c.title} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
                <h3>{c.title}</h3>
                {c.description && <p>{c.description}</p>}
                <p><strong>Level:</strong> {c.level || c.tag || "All"}</p>
                <div style={{ marginTop: 8 }}>
                  <a href={c.link || "#"} target="_blank" rel="noreferrer" className="btn btn-primary">Start</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
