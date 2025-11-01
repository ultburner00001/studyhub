import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../api/httpClient';
import './AskDoubt.css';

function AskDoubt() {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState({ question: '', description: '', tags: [] });
  const [selectedTags, setSelectedTags] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingStates, setLoadingStates] = useState({ fetch: false, submit: false, answers: {}, resolves: {} });
  const [errors, setErrors] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const tags = ['python', 'javascript', 'math', 'web-development', 'algorithms', 'database', 'react', 'nodejs', 'java', 'cloud', 'html', 'css', 'data-science'];

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    setLoadingStates(prev => ({ ...prev, fetch: true }));
    try {
      const res = await httpClient.get('/doubts');
      if (res.data.success) setDoubts(res.data.doubts);
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, fetch: 'Failed to load doubts. Try again later.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubt.question.trim()) {
      setErrors(prev => ({ ...prev, submit: 'Question is required.' }));
      return;
    }
    setLoadingStates(prev => ({ ...prev, submit: true }));
    try {
      const res = await httpClient.post('/doubts', {
        question: newDoubt.question,
        description: newDoubt.description,
        tags: selectedTags,
        author: { name: 'Guest User', avatar: '👤' }
      });
      if (res.data.success) {
        setNewDoubt({ question: '', description: '', tags: [] });
        setSelectedTags([]);
        setSuccessMessages(prev => ({ ...prev, submit: 'Question posted successfully!' }));
        fetchDoubts();
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Failed to post question. Please try again.' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, submit: false }));
    }
  };

  const handleAnswerChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitAnswer = async (id) => {
    if (!answers[id]?.trim()) return;
    setLoadingStates(prev => ({ ...prev, answers: { ...prev.answers, [id]: true } }));
    try {
      await httpClient.post(`/doubts/${id}/answers`, {
        text: answers[id],
        author: { name: 'Guest User', avatar: '👤' }
      });
      setAnswers(prev => ({ ...prev, [id]: '' }));
      fetchDoubts();
    } catch (err) {
      setErrors(prev => ({ ...prev, [`answer-${id}`]: 'Failed to post answer' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, answers: { ...prev.answers, [id]: false } }));
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredDoubts = doubts.filter(d => {
    if (activeFilter === 'resolved' && !d.isResolved) return false;
    if (activeFilter === 'unresolved' && d.isResolved) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      return d.question.toLowerCase().includes(t) || d.description.toLowerCase().includes(t);
    }
    return true;
  });

  return (
    <div className="ask-doubt-page">
      <header className="topbar">
        <div className="brand">
          <span className="logo">📚</span>
          <Link to="/" className="title">StudyHub</Link>
        </div>
        <nav className="nav">
          <Link to="/notes" className="nav-link">Notes</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/timetable" className="nav-link">Timetable</Link>
          <a href="https://drive.google.com/drive/folders/1IWg3sxnK0abUSWn3UUJckaoSMRSS19UD" target="_blank" rel="noreferrer" className="nav-link">PYQs</a>
          <Link to="/ask-doubt" className="nav-link">AskDoubt</Link>
        </nav>
        <div className="actions">
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </header>

      <div className="doubt-container">
        <h1>Ask a Question</h1>
        <form onSubmit={handleSubmitDoubt} className="doubt-form">
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          {successMessages.submit && <div className="success-message">{successMessages.submit}</div>}
          <input
            type="text"
            placeholder="Your question"
            value={newDoubt.question}
            onChange={(e) => setNewDoubt({ ...newDoubt, question: e.target.value })}
          />
          <textarea
            placeholder="Description (optional)"
            value={newDoubt.description}
            onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
          />
          <div className="tags-container">
            {tags.map(tag => (
              <button
                type="button"
                key={tag}
                className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" disabled={loadingStates.submit}>
            {loadingStates.submit ? 'Posting...' : 'Post Question'}
          </button>
        </form>

        <h2>Community Questions</h2>
        {loadingStates.fetch ? (
          <p>Loading questions...</p>
        ) : errors.fetch ? (
          <p className="error-message">{errors.fetch}</p>
        ) : (
          filteredDoubts.map(d => (
            <div key={d._id} className="doubt-card">
              <h3>{d.question}</h3>
              <p>{d.description}</p>
              <div className="doubt-tags">
                {d.tags.map(tag => <span key={tag} className="doubt-tag">#{tag}</span>)}
              </div>
              <h4>Answers</h4>
              {(d.answers || []).map(a => (
                <div key={a._id} className="answer-card">
                  <strong>{a.author?.name || 'Anonymous'}:</strong> {a.text}
                </div>
              ))}
              <textarea
                placeholder="Write your answer..."
                value={answers[d._id] || ''}
                onChange={(e) => handleAnswerChange(d._id, e.target.value)}
              />
              <button
                className="btn btn-small"
                onClick={() => handleSubmitAnswer(d._id)}
                disabled={loadingStates.answers[d._id]}
              >
                {loadingStates.answers[d._id] ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AskDoubt;
