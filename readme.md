# Spotify Music App

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
   - check pinned discord project message

## Setup with Docker

1. **Prerequisites**
   - Start Docker Desktop

2. **Environment Setup**
   - Create a `.env` file in the project folder:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```
   - DM me for the API keys

3. **Run the Application**
   ```bash
   docker-compose up --build
   docker-compose up
   ```

# Git Commands Reference

## Tracking Changes

### Clone a repository
```bash
git clone [url]
```
Creates a copy of a remote repo on your machine

### Check status
```bash
git status
```
Shows current branch and directory you're in

### Stage changes
```bash
git add .
```
Adds all new and modified files

### Commit changes
```bash
git commit -m "insert message here"
```
Records the changes in the repo

### Push to remote
```bash
git push origin [branch]
```
or simply
```bash
git push
```
Uploads your commits to the remote repo

Example: `git push origin main`

### Pull from remote
```bash
git pull origin [branch]
```
or simply
```bash
git pull
```
Downloads any changes from the remote repo

Example: `git pull origin main`

---

## Creating and Pushing a Branch

### List branches
```bash
git branch
```

### Create and switch to new branch
```bash
git checkout -b your-branch-name
```
Make sure it's one word, use hyphens

### Stage, commit, and push
```bash
git add .
git commit -m "xyz's branch"
git push -u origin [branch-name]
```

---

## Merging Branch into Main

### Switch to main
```bash
git checkout main
```

### Update main
```bash
git pull origin main
```

### Merge your branch
```bash
git merge your-branch-name -m "message here"
```

### Push merged changes
```bash
git push origin main
```
