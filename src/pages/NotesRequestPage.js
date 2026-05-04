import React, { useState, useEffect } from 'react';
import { sharesAPI, usersAPI } from '../services/api';
import '../styles/NotesRequestPage.css';

export default function NotesRequestPage() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqs, usersList] = await Promise.all([
        sharesAPI.getRequests(),
        usersAPI.list()
      ]);
      setRequests(reqs);
      setUsers(usersList.filter(u => u.id !== JSON.parse(localStorage.getItem('user')).id));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await sharesAPI.acceptRequest(id);
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await sharesAPI.rejectRequest(id);
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestNote = async (e) => {
    e.preventDefault();
    try {
      if (!selectedUserId) {
        setError('Please select a user');
        return;
      }
      
      // This would require fetching the user's notes first
      // For now, we'll show a message that this requires selecting from available notes
      setError('Note: You need to view a user\'s profile to request their notes');
      setShowRequestForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>Notes Requests</h1>
        <p>Manage requests to share notes with peers</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="requests-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({requests.filter((r) => r.status === 'accepted').length})
        </button>
      </div>

      <div className="requests-list">
        {loading ? (
          <p>Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>No requests to display</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-content">
                <h3>{request.email}</h3>
                <p className="request-notes">
                  Requested: <strong>{request.notesTitle}</strong>
                </p>
                <div className="request-meta">
                  <span className="request-date">{new Date(request.createdAt).toLocaleDateString()}</span>
                  {getStatusBadge(request.status)}
                </div>
              </div>
              <div className="request-actions">
                {request.status === 'pending' && (
                  <>
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
