import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import NotesListPage from './pages/NotesListPage';
import NotesRequestPage from './pages/NotesRequestPage';
import AdminPage from './pages/AdminPage';
import PublicNotesPage from './pages/PublicNotesPage';
import Navbar from './components/Navbar';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authAPI.validate();
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  const isAuthenticated = () => user !== null;
  const isAdmin = () => user?.isAdmin === true;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated() && <Navbar user={user} onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={isAuthenticated() ? <Navigate to="/home" /> : <LoginPage onLoginSuccess={setUser} />}
            />
            <Route
              path="/home"
              element={isAuthenticated() ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated() ? <ProfilePage /> : <Navigate to="/" />}
            />
            <Route
              path="/notes"
              element={isAuthenticated() ? <NotesListPage /> : <Navigate to="/" />}
            />
            <Route
              path="/requests"
              element={isAuthenticated() ? <NotesRequestPage /> : <Navigate to="/" />}
            />
            <Route
              path="/uploaded-notes"
              element={isAuthenticated() ? <PublicNotesPage /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={isAdmin() ? <AdminPage /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
