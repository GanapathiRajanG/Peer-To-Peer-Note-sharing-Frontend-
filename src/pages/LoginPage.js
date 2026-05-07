import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password || (isRegistering && !name)) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (isRegistering && password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const response = isRegistering
        ? await authAPI.register(email, password, name)
        : await authAPI.login(email, password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      onLoginSuccess(response.user);
      navigate('/home');
    } catch (err) {
      setError(err.message || (isRegistering ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (registering) => {
    setIsRegistering(registering);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-brand">
          <span className="login-logo">📝</span>
          <h1>NoteShare</h1>
          <p>Peer-to-peer notes sharing platform</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegistering ? 'active' : ''}`}
            onClick={() => switchMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegistering ? 'active' : ''}`}
            onClick={() => switchMode(true)}
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Enter your email"
              autoComplete="email"
              autoFocus={!isRegistering}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={isRegistering ? 'At least 6 characters' : 'Enter your password'}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegistering
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          {isRegistering
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button
            type="button"
            className="link-button"
            onClick={() => switchMode(!isRegistering)}
          >
            {isRegistering ? 'Sign In' : 'Register for free'}
          </button>
        </p>
      </div>
    </div>
  );
}
