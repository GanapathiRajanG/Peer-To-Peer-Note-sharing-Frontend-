import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import '../styles/AdminPage.css';

export default function AdminPage() {
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [users, dashboardStats] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getStats()
      ]);
      setAccounts(users);
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await adminAPI.deleteUser(id);
        setAccounts(accounts.filter((account) => account.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleBanAccount = async (id) => {
    try {
      await adminAPI.banUser(id);
      const account = accounts.find(a => a.id === id);
      const newStatus = account.status === 'banned' ? 'active' : 'banned';
      setAccounts(
        accounts.map((acc) =>
          acc.id === id ? { ...acc, status: newStatus } : acc
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    if (filter === 'all') return true;
    return account.status === filter;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage user accounts and view system statistics</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.bannedUsers}</h3>
            <p>Banned Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalNotes}</h3>
            <p>Total Notes</p>
          </div>
          <div className="stat-card">
            <h3>{stats.publishedNotes}</h3>
            <p>Published Notes</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      )}

      <div className="admin-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Accounts ({accounts.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({accounts.filter((a) => a.status === 'active').length})
        </button>
        <button
          className={`filter-btn ${filter === 'banned' ? 'active' : ''}`}
          onClick={() => setFilter('banned')}
        >
          Banned ({accounts.filter((a) => a.status === 'banned').length})
        </button>
      </div>

      {loading ? (
        <p>Loading accounts...</p>
      ) : filteredAccounts.length === 0 ? (
        <div className="no-accounts">
          <p>No accounts to display</p>
        </div>
      ) : (
        <div className="accounts-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.email}</td>
                  <td>{account.name}</td>
                  <td>
                    <span className={`status-badge ${account.status}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn-ban ${account.status === 'banned' ? 'unban' : ''}`}
                        onClick={() => handleBanAccount(account.id)}
                      >
                        {account.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
