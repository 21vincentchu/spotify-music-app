# Reverb - Social Music Analytics Platform

A social music analytics platform that transforms your Spotify listening data into shareable insights and community-driven experiences through music ratings and reviews.

## Team: Auralytics
- Amanda Ngo - Team Leader, Frontend
- Julie To - Frontend
- Vincent Chu - Backend
- Esther Brandwein - Backend
- Kevin Lee - Backend

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

### Workflow

1. **Create your feature branch**
   ```bash
   # For frontend work
   git checkout frontend
   git pull origin frontend
   git checkout -b frontend/your-name
   
   # For backend work
   git checkout backend
   git pull origin backend
   git checkout -b backend/feature/your-name
   ```

2. **Work on your feature**
   ```bash
   git add .
   git commit -m "descriptive message about your changes"
   git push origin your-branch-name
   ```

3. **Merge your feature into parent branch (frontend/backend)**
   ```bash
   # Switch to parent branch
   git checkout frontend  # or backend
   
   # Pull latest changes
   git pull origin frontend  # or backend
   
   # Merge your feature branch
   git merge your-branch-name -m "merge: description of feature"
   
   # Push to remote
   git push origin frontend  # or backend
   ```

## Git Commands Reference

### Tracking Changes
```bash
git clone [url]
# Creates copy of a remote repo on your machine

git add .
# Adds all new and modified files

git commit -m "insert message here"
# Records the changes in the repo

git push origin [branch] / git push
# Uploads your commits to the remote repo

git pull origin [branch] / git pull
# Downloads changes from remote. EXAMPLE: git pull origin main
```

### Branch Management
```bash
git branch
# List current branches

git status
# Shows current branch and directory status

git checkout -b your-branch-name
# Create a new branch and switch to it
```

### Checking Branch Status
```bash
git status
# Shows which branch you're on and any changes

git branch -a
# Shows all local and remote branches
```

