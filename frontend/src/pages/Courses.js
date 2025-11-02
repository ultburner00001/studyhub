import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://studyhub-21ux.onrender.com/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.courses);
      })
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCourseClick = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "#22c55e";
      case "Intermediate":
        return "#f59e0b";
      case "Advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div className="courses-page">
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">
            StudyHub
          </Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">
            Notes
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          <Link to="/timetable" className="nav-link">
            Timetable
          </Link>
          <a
            href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            PYQs
          </a>
          <Link to="/ask-doubt" className="nav-link">
            AskDoubt
          </Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="courses-container">
        <h1>Featured Coding Courses</h1>
        <p>
          Master in-demand skills with our comprehensive coding courses taught
          by industry experts.
        </p>

        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                <img src={course.image} alt={course.title} />
                <div
                  className="course-level"
                  style={{ backgroundColor: getLevelColor(course.level) }}
                >
                  {course.level}
                </div>
                <div className="course-overlay">
                  <button
                    className="btn btn-accent preview-btn"
                    onClick={() => handleCourseClick(course.link)}
                  >
                    Watch Preview
                  </button>
                </div>
              </div>

              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <p>
                  <strong>Instructor:</strong> {course.instructor}
                </p>
                <p>
                  ⭐ {course.rating} ({course.students})
                </p>
                <button
                  className="btn btn-primary full-width"
                  onClick={() => handleCourseClick(course.link)}
                >
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;
