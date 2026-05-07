const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot connect to server. Make sure the backend is running.');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {
      // response was not JSON
    }
    throw new Error(message);
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  register: (email, password, name) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  validate: () => apiCall('/auth/validate'),
};

// Notes APIs
export const notesAPI = {
  listPublic: () => apiCall('/notes/all/published'),

  create: (title, content, tags, status) =>
    apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, tags, status }),
    }),

  list: () => apiCall('/notes'),

  get: (id) => apiCall(`/notes/${id}`),

  update: (id, title, content, tags, status) =>
    apiCall(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, tags, status }),
    }),

  delete: (id) =>
    apiCall(`/notes/${id}`, {
      method: 'DELETE',
    }),

  publish: (id) =>
    apiCall(`/notes/${id}/publish`, {
      method: 'PUT',
    }),
};

// Users APIs
export const usersAPI = {
  getProfile: () => apiCall('/users/profile'),

  updateProfile: (name, bio, interests) =>
    apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, bio, interests }),
    }),

  list: () => apiCall('/users'),

  get: (id) => apiCall(`/users/${id}`),
};

// Shares APIs
export const sharesAPI = {
  requestShare: (ownerId, noteId) =>
    apiCall('/shares/request', {
      method: 'POST',
      body: JSON.stringify({ ownerId, noteId }),
    }),

  getRequests: () => apiCall('/shares/requests'),

  acceptRequest: (requestId) =>
    apiCall(`/shares/requests/${requestId}/accept`, {
      method: 'PUT',
    }),

  rejectRequest: (requestId) =>
    apiCall(`/shares/requests/${requestId}/reject`, {
      method: 'PUT',
    }),

  getSharedWithMe: () => apiCall('/shares/shared-with-me'),
};

// Board APIs
export const boardAPI = {
  getAll: () => apiCall('/board'),

  create: (title, description) =>
    apiCall('/board', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),

  markDone: (id) =>
    apiCall(`/board/${id}/done`, { method: 'PUT' }),

  delete: (id) =>
    apiCall(`/board/${id}`, { method: 'DELETE' }),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => apiCall('/admin/users'),

  banUser: (userId) =>
    apiCall(`/admin/users/${userId}/ban`, {
      method: 'PUT',
    }),

  deleteUser: (userId) =>
    apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getStats: () => apiCall('/admin/stats'),
};
