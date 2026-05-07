import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import '../styles/PublicNotesPage.css';

export default function PublicNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchPublicNotes = async () => {
      try {
        setLoading(true);
        const data = await notesAPI.listPublic();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicNotes();
  }, []);

  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  return (
    <div className="public-notes-container">
      <div className="public-notes-header">
        <div>
          <h1>Uploaded Notes</h1>
          <p>All published notes from the community</p>
        </div>
        <div className="public-notes-count">
          {!loading && <span>{filtered.length} note{filtered.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      <div className="public-notes-search">
        <input
          type="text"
          placeholder="Search by title, author or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="public-notes-loading">Loading notes...</div>
      ) : filtered.length === 0 ? (
        <div className="public-notes-empty">
          <span>📭</span>
          <p>{searchTerm ? 'No notes match your search.' : 'No published notes yet. Be the first to share!'}</p>
        </div>
      ) : (
        <div className="public-notes-grid">
          {filtered.map((note) => (
            <div key={note.id} className="public-note-card">
              <div className="public-note-top">
                <div className="public-note-author">
                  <div className="author-avatar">
                    {note.authorName ? note.authorName[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <span className="author-name">
                      {note.authorName}
                      {note.authorId === currentUserId && (
                        <span className="author-you"> (you)</span>
                      )}
                    </span>
                    <span className="note-date">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="public-note-title">{note.title}</h3>

              {note.tags.length > 0 && (
                <div className="public-note-tags">
                  {note.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              {note.content && (
                <div className="public-note-content">
                  <p className={expandedId === note.id ? 'expanded' : 'collapsed'}>
                    {note.content}
                  </p>
                  {note.content.length > 150 && (
                    <button
                      className="btn-toggle"
                      onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                    >
                      {expandedId === note.id ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
