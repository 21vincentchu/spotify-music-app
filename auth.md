ho# Spotify OAuth Authentication Flow

# Overview
## Important: localhost vs 127.0.0.1

**CRITICAL:** Browsers treat `localhost` and `127.0.0.1` as different domains for cookies.

- Spotify callback uses `http://127.0.0.1:8000/callback`, you MUST access:
  - Backend at `http://127.0.0.1:8000`
  - Frontend at `http://127.0.0.1:3000`


got
This application uses Spotify's OAuth 2.0 authorization flow to authenticate users and access their Spotify data.

## Authentication Flow

1. **Frontend (localhost:3000)** - Calls `GET /api/auth/status` with `credentials: 'include'` to check if user has active session
   - If authenticated → Redirect to home page
   - If not authenticated → Show login page
2. **Login Click** - Frontend calls `GET /api/login` with `credentials: 'include'` → Backend returns `{auth_url: "https://accounts.spotify.com/authorize..."}`
3. **Spotify OAuth** - Frontend redirects user to auth_url → User authorizes → Spotify redirects to `/callback` with auth code
4. **Backend /callback** - Exchanges code for token → Saves `token_info` and `userName` to Flask session → Writes user to DB → Redirects to `localhost:3000`
5. **Post-Login** - Frontend calls `GET /api/auth/status` again with `credentials: 'include'` to confirm authentication and get user info
6. **Authenticated Requests** - Frontend makes API calls (e.g., `/api/top-songs/<time_range>`) with `credentials: 'include'` to send session cookie

**CORS**: `supports_credentials=True` allows cross-origin session cookies between `localhost:3000` ↔ `localhost:8000`

## Flow Diagram

```
┌─────────────┐                                    ┌──────────────┐
│   Browser   │                                    │   Spotify    │
│ (port 3000) │                                    │    OAuth     │
└─────┬───────┘                                    └──────┬───────┘
      │                                                   │
      │ 1. GET /api/auth/status                           │
      │    (credentials: 'include')                       │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask Backend   │       │
      │                        │   (port 8000)    │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 2. {authenticated: false} (401)  │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 3. User clicks "Sign In"                          │
      │                                                   │
      │ 4. GET /api/login                                 │
      │    (credentials: 'include')                       │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask Backend   │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 5. {auth_url: "..."}             │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 6. Redirect to Spotify OAuth                      │
      ├──────────────────────────────────────────────────►│
      │                                                   │
      │ 7. User authorizes                                │
      │                                                   │
      │ 8. Redirect to /callback?code=xxx                 │
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
      │ 9. Redirect to localhost:3000    │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 10. GET /api/auth/status                          │
      │     (credentials: 'include')                      │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask verifies  │       │
      │                        │  session cookie  │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 11. {authenticated: true, ...}   │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
      │ 12. GET /api/top-songs/short_term                 │
      │     (credentials: 'include')                      │
      ├──────────────────────────────────┐                │
      │                                  ▼                │
      │                        ┌──────────────────┐       │
      │                        │  Flask verifies  │       │
      │                        │  session cookie  │       │
      │                        └──────────────────┘       │
      │                                  │                │
      │ 13. Returns user data            │                │
      │◄─────────────────────────────────┘                │
      │                                                   │
```

## Key Components

### Backend (Flask)

**Endpoints:**
- `/api/auth/status` - Check if user is authenticated (returns `{authenticated: true/false, userName: "..."}`)
- `/api/login` - Returns Spotify authorization URL
- `/callback` - Handles OAuth callback from Spotify
- `/api/top-songs/<time_range>` - Returns user's top songs (requires authentication)
- `/api/top-artists/<time_range>` - Returns user's top artists (requires authentication)

**Session Management:**
- Flask session stores `token_info` (access token, refresh token, expiry) and `userName`
- Session-specific cache files prevent token conflicts between users
- Session cookie sent with `credentials: 'include'` identifies the user

### Frontend (React)

**Authentication Flow:**
1. On page load, call `GET /api/auth/status` with `credentials: 'include'`
   - If authenticated: redirect to home page
   - If not: stay on login page
2. On login button click, call `GET /api/login` with `credentials: 'include'` to get Spotify auth URL
3. Redirect user to Spotify for authorization
4. After `/callback` redirects back, call `GET /api/auth/status` again to confirm login
5. Make authenticated API calls with `credentials: 'include'`

**Important:** All `fetch()` calls must include `credentials: 'include'` to send session cookies

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

