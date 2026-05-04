import React, { useState, useEffect } from 'react';
import { sharesAPI } from '../services/api';
import '../styles/NotesRequestPage.css';

export default function NotesRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqs = await sharesAPI.getRequests();
      setRequests(reqs);
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
