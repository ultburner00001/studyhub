import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AskDoubt.css";

// ✅ Use your Render backend URL here:
const API_BASE = "https://studyhub-backend.onrender.com/api"; 
// (change to your actual Render backend link)

function AskDoubt() {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState({ question: "", description: "", tags: [] });
  const [selectedTags, setSelectedTags] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const tags = [
    "python",
    "javascript",
    "math",
    "web-dev",
    "algorithms",
    "database",
    "react",
    "nodejs",
    "java",
    "html",
    "css",
  ];

  // ✅ Fetch all doubts
  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/doubts`);
      if (res.data.success) setDoubts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch doubts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  // ✅ Submit new doubt
  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newDoubt.question.trim()) {
      setError("Question is required.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/doubts`, {
        name: "Guest User",
        question: newDoubt.question,
        subject: selectedTags.join(", "),
      });

      if (res.data.success) {
        setMessage("Question posted successfully!");
        setNewDoubt({ question: "", description: "", tags: [] });
        setSelectedTags([]);
        fetchDoubts();
      } else {
        setError("Failed to post question.");
      }
    } catch (err) {
      console.error(err);
      setError("Error posting question. Try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ Add answer
  const handleSubmitAnswer = async (id) => {
    if (!answers[id]?.trim()) return;
    try {
      await axios.post(`${API_BASE}/doubts/${id}/answers`, {
        text: answers[id],
        author: { name: "Guest User" },
      });
      setAnswers((prev) => ({ ...prev, [id]: "" }));
      fetchDoubts();
    } catch (err) {
      console.error("Error adding answer:", err);
      alert("Failed to post answer");
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="ask-doubt-page">
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
          <Link to="/ask-doubt" className="nav-link active">
            Ask Doubt
          </Link>
        </nav>
      </header>

      <div className="doubt-container">
        <h1>Ask a Question</h1>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleSubmitDoubt} className="doubt-form">
          <input
            type="text"
            placeholder="Enter your question"
            value={newDoubt.question}
            onChange={(e) => setNewDoubt({ ...newDoubt, question: e.target.value })}
          />
          <textarea
            placeholder="Add description (optional)"
            value={newDoubt.description}
            onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
          ></textarea>

          <div className="tags-container">
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" disabled={submitLoading}>
            {submitLoading ? "Posting..." : "Post Question"}
          </button>
        </form>

        <h2>Community Questions</h2>
        {loading ? (
          <p>Loading questions...</p>
        ) : doubts.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          doubts.map((d) => (
            <div key={d._id} className="doubt-card">
              <h3>{d.question}</h3>
              <p>Subject: {d.subject || "N/A"}</p>

              <div className="answers-section">
                <h4>Answers</h4>
                {(d.answers || []).length > 0 ? (
                  d.answers.map((a, i) => (
                    <div key={i} className="answer-card">
                      <strong>{a.author?.name || "Anonymous"}:</strong> {a.text}
                    </div>
                  ))
                ) : (
                  <p>No answers yet</p>
                )}

                <textarea
                  placeholder="Write your answer..."
                  value={answers[d._id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [d._id]: e.target.value }))
                  }
                />
                <button
                  className="btn btn-small"
                  onClick={() => handleSubmitAnswer(d._id)}
                >
                  Post Answer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AskDoubt;
