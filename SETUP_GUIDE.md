# Peer-to-Peer Notes Sharing Application - Full Setup Guide

## Overview
This is a complete peer-to-peer notes sharing application with both frontend (React) and backend (Node.js/Express) fully implemented.

## Project Structure

```
notes-sharing/
├── public/              # Frontend static files
├── src/                 # Frontend React application
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── styles/         # CSS files
│   └── App.js          # Main App component
├── server/             # Backend Node.js/Express server
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and other middleware
│   ├── database.js     # Database initialization
│   ├── server.js       # Main server file
│   └── package.json    # Backend dependencies
├── package.json        # Frontend dependencies
└── README.md          # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Install Frontend Dependencies

```bash
# From project root
npm install
```

### Step 3: Configure Environment Variables

#### Backend Configuration
Create a `server/.env` file if you need custom configuration:

```
PORT=5000
JWT_SECRET=your_secret_key_change_in_production
```

#### Frontend Configuration (Optional)
The frontend automatically connects to `http://localhost:5000/api` by default.

To customize, set the environment variable in your terminal or create a `.env.local` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Starting the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on: `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

### Option 2: Run Both Together

Use concurrently in the main directory (if installed):
```bash
npm run dev
```

## Default Admin Account (For Testing)

The application supports admin accounts. To create an admin account:

1. First, register a regular account
2. Manually update the database: Open `server/notes_sharing.db` and set `isAdmin = 1` for the user
3. Or use the database directly via SQL

After login with an admin account, you'll see the "Admin" menu option in the navbar.

## Features Implemented

### Frontend Features
✅ User Registration & Login
✅ User Profile Management
✅ Create, Edit, Delete, Publish Notes
✅ Search & Filter Notes
✅ Share Notes Requests (Accept/Reject)
✅ View Shared Notes
✅ Admin Dashboard with User Management
✅ Real-time Authentication
✅ Responsive Design

### Backend API Features
✅ Authentication (Register, Login, Token Validation)
✅ Notes CRUD Operations
✅ User Profile Management
✅ Note Sharing Request System
✅ Admin User Management & Statistics
✅ Database Integration with SQLite
✅ JWT-based Authentication
✅ CORS Support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate token

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - Get user's notes
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PUT /api/notes/:id/publish` - Publish note

### Users
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users` - Get all active users
- `GET /api/users/:id` - Get user by ID

### Shares
- `POST /api/shares/request` - Request note share
- `GET /api/shares/requests` - Get share requests for user
- `PUT /api/shares/requests/:id/accept` - Accept share request
- `PUT /api/shares/requests/:id/reject` - Reject share request
- `GET /api/shares/shared-with-me` - Get notes shared with user

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/ban` - Ban/unban user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/stats` - Get dashboard statistics (admin only)

## Database

The application uses SQLite with the following tables:

- `users` - User accounts with auth credentials
- `notes` - User notes with content and metadata
- `note_requests` - Share requests between users
- `note_shares` - Active note shares

Database file: `server/notes_sharing.db` (auto-created on first run)

## Building for Production

### Frontend
```bash
npm run build
```

This creates optimized production build in `build/` directory.

### Backend
The backend is production-ready as-is. For deployment:

1. Set environment variables on the production server
2. Ensure PORT is set appropriately
3. Use a process manager like PM2 or systemd

```bash
cd server
NODE_ENV=production npm start
```

## Troubleshooting

### Backend not starting
- Check if port 5000 is already in use: `netstat -tlnp | grep 5000`
- Install dependencies: `cd server && npm install`

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL environment variable
- Check browser console for CORS errors

### Database issues
- Delete `server/notes_sharing.db` to reset database
- Database will be recreated on next backend start

### Port already in use
- Change port: `PORT=5001 npm start` (in server directory)
- Update frontend API URL accordingly

## Development Notes

- All passwords are hashed with bcrypt
- JWTs expire after 7 days
- Notes can have tags for better organization
- Admin role provides access to dashboard
- All API endpoints are protected with CORS
- Database uses WAL mode for better concurrency

## Testing the Application

### Test User Accounts
Register new accounts through the UI or use these credentials if pre-populated:
- Email: test@example.com
- Password: password123

### Test Admin Functions
1. Create an account and manually set `isAdmin = 1` in database
2. Login with that account
3. Access Admin Dashboard from navbar

### Test Features
1. Create notes and save as drafts
2. Publish notes to make them shareable
3. Request access to other users' notes
4. Accept/reject share requests
5. View shared notes on home page

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check API response error messages

---

**Happy Sharing!** 📝
