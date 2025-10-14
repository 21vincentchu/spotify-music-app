# DigitalOcean App Platform Deployment Guide

## Prerequisites
1. GitHub account with your code pushed
2. DigitalOcean account
3. Spotify Developer App configured

## Step 1: Update Spotify Developer Settings

Before deploying, update your Spotify app redirect URIs:

1. Go to https://developer.spotify.com/dashboard
2. Select your app
3. Click "Edit Settings"
4. Add these Redirect URIs (you'll get the actual URL after deployment):
   - `https://your-backend-url.ondigitalocean.app/callback`
   - `http://localhost:8000/callback` (keep for local dev)

## Step 2: Prepare Your Repository

1. Push all code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for DigitalOcean deployment"
   git push origin main
   ```

2. Update `.do/app.yaml`:
   - Replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` with your actual repo

## Step 3: Deploy to DigitalOcean

### Option A: Deploy via Dashboard (Easiest)

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Authorize GitHub and select your repository
5. Select branch: `main`
6. DigitalOcean will detect the app spec file
7. Click "Next" and review the configuration

### Option B: Deploy via CLI

```bash
# Install doctl CLI
brew install doctl  # macOS
# or visit: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml
```

## Step 4: Configure Environment Variables

In DigitalOcean App Platform dashboard, set these secret environment variables for the **backend** service:

### Required Secrets:
- `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret
- `SECRET_KEY`: Generate a secure random key (use: `python -c "import secrets; print(secrets.token_hex(32))"`)

### Auto-configured (by DigitalOcean):
- Database credentials (automatically injected from managed database)
- `SPOTIPY_REDIRECT_URI` (uses ${APP_URL})
- `REACT_APP_API_URL` (frontend gets backend URL)

## Step 5: Initialize Database

After first deployment:

1. Get database connection string from App Platform
2. Use DigitalOcean's console or connect via MySQL client:
   ```bash
   mysql -h your-db-host -u doadmin -p your-database-name
   ```
3. Run your schema:
   ```sql
   source backend/schema.sql
   ```

Or use the "Trusted Sources" feature to allow your local IP and run:
```bash
mysql -h <db-host> -P 25060 -u doadmin -p < backend/schema.sql
```

## Step 6: Update Spotify Redirect URI

1. Once deployed, get your backend URL from App Platform (e.g., `https://backend-xxxxx.ondigitalocean.app`)
2. Update Spotify Developer Dashboard with: `https://backend-xxxxx.ondigitalocean.app/callback`

## Step 7: Test Your Deployment

1. Visit your frontend URL (e.g., `https://frontend-xxxxx.ondigitalocean.app`)
2. Click "Sign In with Spotify"
3. Verify OAuth flow works

## Costs (Estimated)

- Frontend (basic-xxs): ~$5/month
- Backend (basic-xxs): ~$5/month
- MySQL Database (basic): ~$15/month
- **Total: ~$25/month**

## Troubleshooting

### Build fails:
- Check build logs in App Platform dashboard
- Verify Dockerfile paths are correct
- Ensure requirements.txt is properly formatted

### Database connection fails:
- Verify database is fully provisioned (can take 5-10 minutes)
- Check that schema.sql was applied
- Review backend logs for connection errors

### OAuth fails:
- Verify Spotify redirect URI matches exactly (including https://)
- Check that SPOTIFY_CLIENT_ID and SECRET are set correctly
- Review backend logs for auth errors

## Local Development

Keep using your existing setup:
```bash
docker-compose up
```

Your `.env` file is for local dev only - production uses App Platform environment variables.

## Rollbacks

To rollback a deployment:
1. Go to App Platform dashboard
2. Click on your app
3. Go to "Settings" > "App Spec"
4. Choose a previous deployment and redeploy

## Auto-Deploy

With `deploy_on_push: true` in app.yaml, every push to `main` automatically deploys.

To disable:
1. Edit `.do/app.yaml`
2. Set `deploy_on_push: false`
3. Deploy manually via dashboard or CLI
