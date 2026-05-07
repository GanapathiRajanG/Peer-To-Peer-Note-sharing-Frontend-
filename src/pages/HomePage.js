import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sharesAPI } from '../services/api';
import '../styles/HomePage.css';

export default function HomePage() {
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        setLoading(true);
        const notes = await sharesAPI.getSharedWithMe();
        setRecentNotes(notes.slice(0, 6)); // Show recent 6 notes
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNotes();
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to Notes Sharing</h1>
        <p>Share and discover knowledge with your peers</p>
      </div>

      <div className="home-content">
        <div className="actions-section">
          <Link to="/notes" className="action-btn primary">
            View All Notes
          </Link>
          <Link to="/requests" className="action-btn secondary">
            Check Requests
          </Link>
        </div>

        <div className="recent-notes-section">
          <h2>Recent Notes from Network</h2>
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <p>Loading notes...</p>
          ) : (
            <div className="notes-grid">
              {recentNotes.length === 0 ? (
                <p>No shared notes yet. Request access to notes from your peers!</p>
              ) : (
                recentNotes.map((note) => (
                  <div key={note.id} className="note-card">
                    <h3>{note.title}</h3>
                    <p>By <strong>{note.author}</strong></p>
                    <p className="note-date">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
