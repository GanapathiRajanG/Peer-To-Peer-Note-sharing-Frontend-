import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.isAdmin === true;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          📝 Notes Sharing
        </Link>

        <div className="navbar-menu">
          <Link to="/home" className="nav-link">
            Home
          </Link>
          <Link to="/notes" className="nav-link">
            My Notes
          </Link>
          <Link to="/requests" className="nav-link">
            Requests
          </Link>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className="nav-logout">
            Logout
          </button>
        </div>

        <div className="navbar-user">
          <span className="user-email">{currentUser.email}</span>
        </div>
      </div>
    </nav>
  );
}
