# Spotify OAuth Authentication Flow

## Overview

This application uses Spotify's OAuth 2.0 authorization flow to authenticate users and access their Spotify data.

## Authentication Flow

1. **Frontend (localhost:3000)** - Checks auth state; shows login if no token
2. **Login Click** - Frontend calls `GET localhost:8000/api/login` → Backend returns `{auth_url: "https://accounts.spotify.com/authorize..."}`
3. **Spotify OAuth** - User authorizes → Spotify redirects to `/callback` with auth code
4. **Backend /callback** - Exchanges code for token → Saves to Flask session → Writes user to DB → Redirects to `localhost:3000`
5. **Authenticated Requests** - Frontend uses `credentials: 'include'` to send session cookie with API calls

**CORS**: `supports_credentials=True` allows cross-origin session cookies between `localhost:3000` ↔ `localhost:8000`

## Flow Diagram

```
┌─────────────┐                                    ┌──────────────┐
│   Browser   │                                    │   Spotify    │
│ (port 3000) │                                    │    OAuth     │
└─────┬───────┘                                    └──────┬───────┘
      │                                                   │
      │ 1. Check auth state                               │
      │ (no token)                                        │
      │                                                   │
      │ 2. GET /api/login                                 │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask Backend   │       │
      │                        │   (port 8000)    │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 3. {auth_url: "..."}             │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 4. Redirect to Spotify OAuth                      │
      ├──────────────────────────────────────────────────►│
      │                                                   │
      │ 5. User authorizes                                │
      │                                                   │
      │ 6. Redirect to /callback?code=xxx                 │
      │◄──────────────────────────────────────────────────┤
      │                                                   │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  /callback       │       │
      │                        │  - Exchange code │       │
      │                        │  - Save session  │       │
      │                        │  - Write to DB   │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 7. Redirect to localhost:3000    │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 8. Authenticated API calls                        │
      │    (credentials: 'include')                       │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask verifies  │       │
      │                        │  session cookie  │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 9. Returns user data             │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
```

## Key Components

### Backend (Flask)

**Endpoints:**
- `/api/login` - Returns Spotify authorization URL
- `/callback` - Handles OAuth callback from Spotify
- `/api/top-songs/<time_range>` - Returns user's top songs
- `/api/top-artists/<time_range>` - Returns user's top artists

**Session Management:**
- Flask session stores OAuth tokens and user information
- Session-specific cache files prevent token conflicts between users
- Session cookie sent with `credentials: 'include'` identifies the user

### Frontend (React)

**Authentication:**
- Calls `/api/login` to get Spotify authorization URL
- Redirects user to Spotify for authorization
- After callback, makes authenticated API calls with `credentials: 'include'`

### CORS Configuration

```python
CORS(app, supports_credentials=True)
```

This configuration:
- Allows cross-origin requests from `localhost:3000` to `localhost:8000`
- Permits session cookies to be sent with requests
- Required for frontend-backend communication in development

## Docker Port Mapping

When running via Docker Compose:
- Frontend: `localhost:3000` → container port `3000`
- Backend: `localhost:8000` → container port `5000`
- Database: `localhost:3306` → container port `3306`

