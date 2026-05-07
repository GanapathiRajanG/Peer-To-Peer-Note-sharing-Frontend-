import React, { useState, useEffect } from 'react';
import { sharesAPI, boardAPI } from '../services/api';
import '../styles/NotesRequestPage.css';

export default function NotesRequestPage() {
  const [tab, setTab] = useState('board');

  // Board state
  const [boardRequests, setBoardRequests] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Share requests state
  const [requests, setRequests] = useState([]);
  const [shareLoading, setShareLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchBoard();
    fetchShareRequests();
  }, []);

  const fetchBoard = async () => {
    try {
      setBoardLoading(true);
      const data = await boardAPI.getAll();
      setBoardRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBoardLoading(false);
    }
  };

  const fetchShareRequests = async () => {
    try {
      setShareLoading(true);
      const data = await sharesAPI.getRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError('Title is required'); return; }
    try {
      setSubmitting(true);
      setFormError('');
      const newReq = await boardAPI.create(formTitle.trim(), formDesc.trim());
      setBoardRequests([newReq, ...boardRequests]);
      setFormTitle('');
      setFormDesc('');
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      await boardAPI.markDone(id);
      setBoardRequests(boardRequests.map(r => r.id === id ? { ...r, status: 'done' } : r));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await boardAPI.delete(id);
      setBoardRequests(boardRequests.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async (id) => {
    try {
      await sharesAPI.acceptRequest(id);
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await sharesAPI.rejectRequest(id);
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>Notes Requests</h1>
        <p>Post note requests for the community or manage share requests</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>
          📋 Request Board
        </button>
        <button className={`tab-btn ${tab === 'shares' ? 'active' : ''}`} onClick={() => setTab('shares')}>
          🔔 Share Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="tab-badge">{requests.filter(r => r.status === 'pending').length}</span>
          )}
        </button>
      </div>

      {/* ── BOARD TAB ── */}
      {tab === 'board' && (
        <div>
          <div className="board-toolbar">
            <span className="board-count">{boardRequests.length} request{boardRequests.length !== 1 ? 's' : ''}</span>
            <button className="btn-add-request" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Request'}
            </button>
          </div>

          {showForm && (
            <form className="add-request-form" onSubmit={handleAddRequest}>
              <h3>New Note Request</h3>
              {formError && <div className="form-error">{formError}</div>}
              <input
                type="text"
                placeholder="What note are you looking for? *"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="form-input"
                maxLength={120}
              />
              <textarea
                placeholder="Add more details (optional)..."
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="form-textarea"
                rows={3}
                maxLength={500}
              />
              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          )}

          {boardLoading ? (
            <p className="loading-text">Loading requests...</p>
          ) : boardRequests.length === 0 ? (
            <div className="no-requests">
              <p>No requests yet. Be the first to post one!</p>
            </div>
          ) : (
            <div className="requests-list">
              {boardRequests.map(req => (
                <div key={req.id} className={`request-card board-card ${req.status === 'done' ? 'card-done' : ''}`}>
                  <div className="request-content">
                    <div className="board-card-top">
                      <div className="author-avatar-sm">
                        {req.userName ? req.userName[0].toUpperCase() : '?'}
                      </div>
                      <span className="board-author">
                        {req.userName}
                        {req.userId === currentUser.id && <span className="you-tag"> (you)</span>}
                      </span>
                      <span className="request-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="board-title">{req.title}</h3>
                    {req.description && <p className="board-desc">{req.description}</p>}
                  </div>
                  <div className="request-actions">
                    {req.status === 'done' ? (
                      <span className="status-badge done">✓ Request Done</span>
                    ) : (
                      req.userId === currentUser.id && (
                        <>
                          <button className="btn-done" onClick={() => handleMarkDone(req.id)}>
                            Mark as Done
                          </button>
                          <button className="btn-delete-board" onClick={() => handleDeleteBoard(req.id)}>
                            Delete
                          </button>
                        </>
                      )
                    )}
                    {req.status === 'open' && req.userId !== currentUser.id && (
                      <span className="status-badge open">Open</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SHARE REQUESTS TAB ── */}
      {tab === 'shares' && (
        <div>
          <div className="requests-filter">
            {['all', 'pending', 'accepted', 'rejected'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {' '}({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
              </button>
            ))}
          </div>

          <div className="requests-list">
            {shareLoading ? (
              <p className="loading-text">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <div className="no-requests"><p>No requests to display</p></div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-content">
                    <h3>{request.email}</h3>
                    <p className="request-notes">Requested: <strong>{request.notesTitle}</strong></p>
                    <div className="request-meta">
                      <span className="request-date">{new Date(request.createdAt).toLocaleDateString()}</span>
                      <span className={`status-badge ${request.status}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="request-actions">
                    {request.status === 'pending' && (
                      <>
                        <button className="btn-accept" onClick={() => handleAccept(request.id)}>Accept</button>
                        <button className="btn-reject" onClick={() => handleReject(request.id)}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
