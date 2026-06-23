# Reverb - Social Music Analytics Platform

A social music analytics platform that transforms your Spotify listening data into shareable insights and community-driven experiences through music ratings and reviews.

## Manual Setup

1. **Create a virtual environment** 
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   cd spotify-music-app
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Create a `.env` file in the project folder
   - Add these variables:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     
     MYSQL_ROOT_PASSWORD=password_here
     MYSQL_DATABASE=database_name_here
     ```
   - Check pinned Discord project message for credentials

## Setup with Docker

1. **Prerequisites**
   - Start Docker Desktop

2. **Environment Setup**
   - Create a `.env` file in the project folder:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```
   - DM team for API keys

3. **Run the Application**
   ```bash
   docker-compose up --build
   docker-compose up
   ```

## Branch Structure & Merging

### Branch Hierarchy
```
main
├── frontend
│   ├── frontend/amanda
│   └── frontend/julie
└── backend
    └── backend/feature/person
```

