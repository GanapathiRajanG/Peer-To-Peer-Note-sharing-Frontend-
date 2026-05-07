import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    bio: '',
    interests: '',
    createdAt: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    try {
      setError('');
      await usersAPI.updateProfile(profile.name, profile.bio, profile.interests);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <div className="profile-header">
          <div className="profile-avatar">
            <label htmlFor="profile-pic-input" className="avatar-label">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="#6c63ff" />
                <text x="50" y="50" fontSize="36" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="bold">{profile.name ? profile.name[0].toUpperCase() : '?'}</text>
              </svg>
              <span className="avatar-text">Profile Picture</span>
            </label>
            <input type="file" id="profile-pic-input" accept="image/*" style={{ display: 'none' }} />
          </div>
          <div className="profile-title">
            <h1>{profile.name || profile.email}</h1>
            <p>{profile.email}</p>
          </div>
        </div>

        <div className="profile-content">
          {error && <div className="error-message">{error}</div>}
          
          {isEditing ? (
            <form className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Interests</label>
                <input
                  type="text"
                  value={profile.interests}
                  onChange={(e) => handleChange('interests', e.target.value)}
                  placeholder="e.g., React, Node.js, Web Development"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>

              <div className="info-group">
                <label>Bio</label>
                <p>{profile.bio || 'No bio yet'}</p>
              </div>

              <div className="info-group">
                <label>Interests</label>
                <p>{profile.interests || 'No interests added yet'}</p>
              </div>

              <div className="info-group">
                <label>Joined</label>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <h3>—</h3>
          <p>Notes Created</p>
        </div>
        <div className="stat">
          <h3>—</h3>
          <p>Notes Received</p>
        </div>
        <div className="stat">
          <h3>—</h3>
          <p>Network Members</p>
        </div>
      </div>
    </div>
  );
}
