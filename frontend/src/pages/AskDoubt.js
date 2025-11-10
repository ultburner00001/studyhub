// src/pages/AskDoubt.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API = process.env.REACT_APP_API_BASE || "https://studyhub-21ux.onrender.com/api";

export default function AskDoubt() {
  const [doubts, setDoubts] = useState([]);
  const [question, setQuestion] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/doubts`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setDoubts(data.data || data || []);
      })
      .catch((err) => {
        console.error("Fetch doubts error:", err);
        setDoubts([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const postDoubt = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    try {
      const res = await fetch(`${API}/doubts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Guest", question, description: desc }),
      });
      const data = await res.json();
      if (data.success || res.status === 201) {
        setDoubts((prev) => [data.data || data.question || data, ...prev]);
        setQuestion("");
        setDesc("");
      } else {
        // fallback local push
        setDoubts((prev) => [{ _id: `local-${Date.now()}`, question, description: desc, answers: [] }, ...prev]);
        setQuestion(""); setDesc("");
      }
    } catch (err) {
      console.error("Post doubt error:", err);
      setDoubts((prev) => [{ _id: `local-${Date.now()}`, question, description: desc, answers: [] }, ...prev]);
      setQuestion(""); setDesc("");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Ask a Question</h2>

        <form onSubmit={postDoubt} style={{ marginBottom: 16 }}>
          <input
            placeholder="Short question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ width: "100%", padding: 8, height: 90 }}
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary" type="submit">Post Question</button>
          </div>
        </form>

        <h3>Community Questions</h3>
        {loading ? <p>Loading...</p> : doubts.length === 0 ? <p>No questions yet.</p> : (
          <div style={{ display: "grid", gap: 12 }}>
            {doubts.map((d) => (
              <div key={d._id || d.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
                <h4>{d.question}</h4>
                {d.description && <p>{d.description}</p>}
                {(d.answers || []).length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    <strong>Answers</strong>
                    {(d.answers || []).map((a, i) => <div key={i}>{a.text}</div>)}
                  </div>
                ) : <p style={{ color: "#666" }}>No answers yet</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
