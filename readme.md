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

## git commands references
### Tracking changes 
```
git clone [url] #creates copy of a remoate repo on your machine
git status #shows current branch and directory you're in
git add . #adds all new and modified files
git commit -m "insert message here" #records the changes in the repo
git push origin [branch] $uploads your commits to the remote repo. check using git status. EXAMPLE: git push origin main
git pull origin [branch] #downloads any changes from the remote repo. check using git status.EXAMPLE: git pull origin main

```

### Make git branch and push to github
```
git branch #list the current branches
git checkout -b your-branch-name #create a new branch and switch to it. make sure its one word, use hyphens
git add . #stage your changes
git commit -m [xyz's branch] #commit
git push -u origin [branch name] #push
'''
```

### Merging your branch into the main
```
git checkout main #switching to the main branch
git pull origin main #making sure main is up to date
git merge your-branch-name -m "message here" #merge your branch into main
git push origin main #push the merged changes to GitHub

```
