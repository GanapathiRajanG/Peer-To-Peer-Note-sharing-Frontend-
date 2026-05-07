import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import '../styles/NotesListPage.css';

export default function NotesListPage() {
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.list();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title) {
        setError('Title is required');
        return;
      }

      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      const newNote = await notesAPI.create(formData.title, formData.content, tags, formData.status);
      
      setNotes([newNote, ...notes]);
      setFormData({ title: '', content: '', tags: '', status: 'draft' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditNote = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title) {
        setError('Title is required');
        return;
      }

      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      await notesAPI.update(editingId, formData.title, formData.content, tags, formData.status);
      
      setNotes(notes.map(n => n.id === editingId ? {
        ...n,
        ...formData,
        tags
      } : n));
      
      setEditingId(null);
      setFormData({ title: '', content: '', tags: '', status: 'draft' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.delete(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublishNote = async (id) => {
    try {
      await notesAPI.publish(id);
      setNotes(notes.map(n => n.id === id ? { ...n, status: 'published' } : n));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      status: note.status
    });
    setShowForm(false);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', tags: '', status: 'draft' });
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFilter = filter === 'all' || note.status === filter;
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="notes-list-container">
      <div className="notes-header">
        <h1>My Notes</h1>
        <button 
          className="btn-create" 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ title: '', content: '', tags: '', status: 'draft' });
          }}
        >
          {showForm ? '✕ Cancel' : '+ Create New Note'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {(showForm || editingId) && (
        <form className="note-form" onSubmit={editingId ? handleEditNote : handleCreateNote}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Note title"
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Note content"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., javascript, react, tutorial"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingId ? 'Update Note' : 'Create Note'}
            </button>
            <button type="button" className="btn-cancel" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="notes-controls">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published
          </button>
          <button
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Drafts
          </button>
        </div>
      </div>

      <div className="notes-list">
        {loading ? (
          <p>Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="no-notes">
            <p>No notes found</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="note-item">
              <div className="note-info">
                <h3>{note.title}</h3>
                <div className="note-meta">
                  <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                  <span className={`note-status ${note.status}`}>
                    {note.status}
                  </span>
                </div>
                <div className="note-tags">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="note-actions">
                <button className="btn-view" onClick={() => window.alert('View full note:\n\n' + note.content)}>View</button>
                <button className="btn-edit" onClick={() => startEdit(note)}>Edit</button>
                {note.status === 'draft' && (
                  <button className="btn-share" onClick={() => handlePublishNote(note.id)}>Publish</button>
                )}
                <button className="btn-delete" onClick={() => handleDeleteNote(note.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
