import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Courses.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://studyhub-21ux.onrender.com/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch courses from backend on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/courses`);
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          setError(response.data.message || "Failed to load courses.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Server error while fetching courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ✅ Handle “Watch Preview” or “Start Learning” click
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
          <Link to="/ask-doubt" className="nav-link">AskDoubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="courses-container">
        <div className="courses-header">
          <h1>Featured Coding Courses</h1>
          <p>Master in-demand skills with our comprehensive coding courses taught by industry experts</p>
        </div>

        {/* ✅ Loading and error handling */}
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id || course.id} className="course-card">
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

                    <div className="course-instructor">
                      <span className="instructor-avatar">👤</span>
                      <span>By {course.instructor}</span>
                    </div>

                    <div className="course-meta">
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⭐</span>
                        <span>
                          {course.rating} ({course.students})
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary full-width"
                      onClick={() => handleCourseClick(course.link)}
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No courses found.</p>
            )}
          </div>
        )}

        <div className="courses-features">
          <h2>Why Learn With StudyHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Project-Based Learning</h4>
              <p>Build real-world projects and portfolio pieces</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h4>Expert Instructors</h4>
              <p>Learn from industry professionals with years of experience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h4>Lifetime Access</h4>
              <p>Access course materials anytime, anywhere</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4>Certification</h4>
              <p>Earn certificates to showcase your skills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
