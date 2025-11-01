import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminClient from '../api/adminClient';
import '../css/Admin.css';

const EmptyState = ({ icon, title, text, actionText, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{text}</p>
      {actionText && (
        <button className="empty-state-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalDoubts: 0,
    totalTimetables: 0,
    todayUsers: 0,
    todayNotes: 0,
    todayDoubts: 0,
    recentActivity: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [loadingOperations, setLoadingOperations] = useState({});
  const navigate = useNavigate();

  // Polling interval reference
  const pollIntervalRef = React.useRef(null);

  // Real-time updates function
  const pollForUpdates = React.useCallback(async () => {
    try {
      // Poll for general stats
      const statsResponse = await adminClient.get('/admin/stats');
      if (statsResponse.data.success) {
        const newStats = statsResponse.data.stats;
        setStats(prevStats => {
          // Check if there are new users or doubts
          if (newStats.totalUsers > prevStats.totalUsers) {
            addToast('New user registration detected!', 'info');
          }
          if (newStats.totalDoubts > prevStats.totalDoubts) {
            addToast('New doubt posted!', 'info');
          }
          return newStats;
        });
      }

      // Poll for specific tab data
      if (activeTab === 'users') {
        const usersResponse = await adminClient.get('/admin/users');
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.users);
        }
      } else if (activeTab === 'doubts') {
        const doubtsResponse = await adminClient.get('/admin/doubts');
        if (doubtsResponse.data.success) {
          setDoubts(doubtsResponse.data.doubts);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [activeTab]);

  // Setup polling
  useEffect(() => {
    if (statsLoaded) {
      pollIntervalRef.current = setInterval(pollForUpdates, 30000); // Poll every 30 seconds
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [statsLoaded, pollForUpdates]);

  useEffect(() => {
    const initializeAdmin = async () => {
      setLoadingOperations({
        ...loadingOperations,
        stats: true,
        users: activeTab === 'users',
        doubts: activeTab === 'doubts'
      });

      try {
        const [statsResponse, usersResponse, doubtsResponse] = await Promise.all([
          adminClient.get('/admin/stats'),
          activeTab === 'users' ? adminClient.get('/admin/users') : Promise.resolve(null),
          activeTab === 'doubts' ? adminClient.get('/admin/doubts') : Promise.resolve(null)
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
          setError('');
          setLoading(false);
          setStatsLoaded(true);
        }

        if (usersResponse && activeTab === 'users') {
          setUsers(usersResponse.data.users);
        }
        if (doubtsResponse && activeTab === 'doubts') {
          setDoubts(doubtsResponse.data.doubts);
        }
      } catch (error) {
        console.error('Error initializing admin data:', error);
        const errorMessage = mapErrorToMessage(error, 'load data');
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setLoadingOperations({});
      }
    };

    initializeAdmin();
  // Since fetchStats is defined in component scope and calls setStats/setError/addToast, 
  // which are stable references from useState, it's safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminClient.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      const errorMessage = mapErrorToMessage(error, 'load statistics');
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      setStatsLoaded(true);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingOperations(prev => ({ ...prev, users: true }));
      const response = await adminClient.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = mapErrorToMessage(error, 'load users');
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, users: false }));
    }
  };

  const fetchNotes = async () => {
    try {
      setLoadingOperations(prev => ({ ...prev, notes: true }));
      const response = await adminClient.get('/admin/notes');
      if (response.data.success) {
        setNotes(response.data.notes);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      const errorMessage = mapErrorToMessage(error, 'load notes');
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, notes: false }));
    }
  };

  const fetchDoubts = async () => {
    try {
      setLoadingOperations(prev => ({ ...prev, doubts: true }));
      const response = await adminClient.get('/admin/doubts');
      if (response.data.success) {
        setDoubts(response.data.doubts);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching doubts:', error);
      const errorMessage = mapErrorToMessage(error, 'load doubts');
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, doubts: false }));
    }
  };

  const deleteUser = async (userId, userName, notesCount, doubtsCount) => {
    const confirmMessage = `Delete user "${userName}" and all their data? This will permanently remove ${notesCount} notes and ${doubtsCount} doubts.`;
    if (!window.confirm(confirmMessage)) return;

    // Optimistic update
    const originalUsers = [...users];
    setUsers(prev => prev.filter(user => user._id !== userId));

    try {
      setLoadingOperations(prev => ({ ...prev, [`deleteUser_${userId}`]: true }));
      await adminClient.delete(`/admin/users/${userId}`);
      fetchStats();
      addToast(`User "${userName}" deleted successfully.`, 'success');
    } catch (error) {
      // Revert optimistic update
      setUsers(originalUsers);
      console.error('Error deleting user:', error);
      const errorMessage = mapErrorToMessage(error, 'delete user');
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [`deleteUser_${userId}`]: false }));
    }
  };

  const deleteNote = async (noteId, noteTitle) => {
    if (!window.confirm(`Delete note "${noteTitle}"? This action cannot be undone.`)) return;

    // Optimistic update
    const originalNotes = [...notes];
    setNotes(prev => prev.filter(note => note._id !== noteId));

    try {
      setLoadingOperations(prev => ({ ...prev, [`deleteNote_${noteId}`]: true }));
      await adminClient.delete(`/admin/notes/${noteId}`);
      fetchStats();
      addToast(`Note "${noteTitle}" deleted successfully.`, 'success');
    } catch (error) {
      // Revert optimistic update
      setNotes(originalNotes);
      console.error('Error deleting note:', error);
      const errorMessage = mapErrorToMessage(error, 'delete note');
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [`deleteNote_${noteId}`]: false }));
    }
  };

  const deleteDoubt = async (doubtId, doubtQuestion) => {
    if (!window.confirm(`Delete doubt "${doubtQuestion}"? This action cannot be undone.`)) return;

    // Optimistic update
    const originalDoubts = [...doubts];
    setDoubts(prev => prev.filter(doubt => doubt._id !== doubtId));

    try {
      setLoadingOperations(prev => ({ ...prev, [`deleteDoubt_${doubtId}`]: true }));
      await adminClient.delete(`/admin/doubts/${doubtId}`);
      fetchStats();
      addToast(`Doubt "${doubtQuestion}" deleted successfully.`, 'success');
    } catch (error) {
      // Revert optimistic update
      setDoubts(originalDoubts);
      console.error('Error deleting doubt:', error);
      const errorMessage = mapErrorToMessage(error, 'delete doubt');
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [`deleteDoubt_${doubtId}`]: false }));
    }
  };

  const toggleDoubtResolve = async (doubtId) => {
    // Optimistic update
    const originalDoubts = [...doubts];
    setDoubts(prev => prev.map(doubt => 
      doubt._id === doubtId ? { ...doubt, isResolved: !doubt.isResolved } : doubt
    ));

    try {
      setLoadingOperations(prev => ({ ...prev, [`resolveDoubt_${doubtId}`]: true }));
      await adminClient.put(`/admin/doubts/${doubtId}/resolve`);
      addToast('Doubt status updated successfully.', 'success');
    } catch (error) {
      // Revert optimistic update
      setDoubts(originalDoubts);
      console.error('Error updating doubt:', error);
      const errorMessage = mapErrorToMessage(error, 'update doubt status');
      addToast(errorMessage, 'error');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [`resolveDoubt_${doubtId}`]: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');

    if (tab === 'users') fetchUsers();
    else if (tab === 'notes') fetchNotes();
    else if (tab === 'doubts') fetchDoubts();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const mapErrorToMessage = (error, context = '') => {
  let errorMessage = `Failed to ${context}`;
  if (error.code === 'ECONNABORTED') {
    errorMessage = `Request timed out${context ? ` while ${context}` : ''}.`;
  } else if (error.message === 'Network Error') {
    errorMessage = `Network error${context ? ` while ${context}` : ''}.`;
  } else if (error?.response?.status === 401) {
    errorMessage = 'Your session has expired. Please login again.';
  } else if (error?.response?.status === 403) {
    errorMessage = 'You do not have permission to access this resource.';
  } else if (error?.response?.status === 500) {
    errorMessage = `Server error${context ? ` while ${context}` : ''}. Please try again later.`;
  }
  return errorMessage;
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'note': return '📝';
      case 'doubt': return '❓';
      case 'user': return '👤';
      default: return '🔔';
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="toast-close">×</button>
          </div>
        ))}
      </div>
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">
            <span>📊</span>
            StudyHub Admin
          </h1>
          <div className="admin-controls">
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              🏠 Home
            </button>
            <button onClick={fetchStats} className="btn btn-secondary">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
            <button onClick={() => {
              setError('');
              if (activeTab === 'dashboard') fetchStats();
              else if (activeTab === 'users') fetchUsers();
              else if (activeTab === 'notes') fetchNotes();
              else if (activeTab === 'doubts') fetchDoubts();
            }} className="btn btn-retry">
              Retry
            </button>
          </div>
        )}

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            👥 Users ({stats.totalUsers})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => handleTabChange('notes')}
          >
            📝 Notes ({stats.totalNotes})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'doubts' ? 'active' : ''}`}
            onClick={() => handleTabChange('doubts')}
          >
            ❓ Doubts ({stats.totalDoubts})
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
                <div className="stat-today">+{stats.todayUsers} today</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-number">{stats.totalNotes}</div>
                <div className="stat-label">Notes Created</div>
                <div className="stat-today">+{stats.todayNotes} today</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-number">{stats.totalDoubts}</div>
                <div className="stat-label">Doubts Asked</div>
                <div className="stat-today">+{stats.todayDoubts} today</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-number">{stats.totalTimetables}</div>
                <div className="stat-label">Timetables</div>
                <div className="stat-today">Active schedules</div>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="activity-card">
                <div className="card-header">
                  <span>🔔</span>
                  <h3 className="card-title">Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {stats.recentActivity.length === 0 ? (
                    <EmptyState
                      icon="🔍"
                      title="No Recent Activity"
                      text="There hasn't been any platform activity yet. New activities will appear here as users interact with the platform."
                    />
                  ) : (
                    stats.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className={`activity-icon ${activity.type}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                          <div className="activity-text">
                            <strong>{activity.user}</strong> {activity.action} {activity.type}
                            {activity.title && `: ${activity.title}`}
                          </div>
                          <div className="activity-time">
                            {formatTime(activity.time)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="management-section">
            <h2>User Management</h2>
            {loadingOperations.users ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No Users Found"
                text="There are no registered users in the system yet."
                actionText="Refresh"
                onAction={() => fetchUsers()}
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Notes</th>
                      <th>Doubts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <span className="user-avatar">{user.avatar}</span>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatTime(user.createdAt)}</td>
                        <td>{user.notesCount}</td>
                        <td>{user.doubtsCount}</td>
                        <td>
                          <button 
                            className="btn btn-delete"
                            onClick={() => deleteUser(user._id, user.name, user.notesCount, user.doubtsCount)}
                            disabled={loadingOperations[`deleteUser_${user._id}`]}
                          >
                            {loadingOperations[`deleteUser_${user._id}`] ? '⏳' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="management-section">
            <h2>Notes Management</h2>
            {loadingOperations.notes ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No Notes Found"
                text="No study notes have been created yet."
                actionText="Refresh"
                onAction={() => fetchNotes()}
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Created</th>
                      <th>Content Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(note => (
                      <tr key={note._id}>
                        <td className="note-title-cell">{note.title}</td>
                        <td>{note.author?.name || 'Unknown Author'}</td>
                        <td>{formatTime(note.createdAt)}</td>
                        <td className="note-preview-cell">
                          {note.content.substring(0, 100)}...
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete"
                            onClick={() => deleteNote(note._id, note.title)}
                            disabled={loadingOperations[`deleteNote_${note._id}`]}
                          >
                            {loadingOperations[`deleteNote_${note._id}`] ? '⏳' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="management-section">
            <h2>Doubts Management</h2>
            {loadingOperations.doubts ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading doubts...</p>
              </div>
            ) : doubts.length === 0 ? (
              <EmptyState
                icon="❓"
                title="No Doubts Found"
                text="No student questions have been posted yet."
                actionText="Refresh"
                onAction={() => fetchDoubts()}
              />
            ) : (
              <div className="doubts-list">
                {doubts.map(doubt => (
                  <div key={doubt._id} className="doubt-card">
                    <div className="doubt-header">
                      <div className="doubt-meta">
                        <span className="doubt-author">{doubt.author.name}</span>
                        <span className="doubt-time">{formatTime(doubt.createdAt)}</span>
                        <span className={`doubt-status ${doubt.isResolved ? 'resolved' : 'pending'}`}>
                          {doubt.isResolved ? '✅ Resolved' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="doubt-actions">
                        <button 
                          className="btn btn-resolve"
                          onClick={() => toggleDoubtResolve(doubt._id)}
                          disabled={loadingOperations[`resolveDoubt_${doubt._id}`]}
                        >
                          {loadingOperations[`resolveDoubt_${doubt._id}`] ? '⏳' : (doubt.isResolved ? '↶ Reopen' : '✓ Resolve')}
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => deleteDoubt(doubt._id, doubt.question)}
                          disabled={loadingOperations[`deleteDoubt_${doubt._id}`]}
                        >
                          {loadingOperations[`deleteDoubt_${doubt._id}`] ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </div>
                    <div className="doubt-question">{doubt.question}</div>
                    {doubt.description && (
                      <div className="doubt-description">{doubt.description}</div>
                    )}
                    <div className="doubt-footer">
                      <span className="answers-count">
                        {doubt.answers.length} {doubt.answers.length === 1 ? 'Answer' : 'Answers'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;