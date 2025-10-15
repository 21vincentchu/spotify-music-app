
## Initialize Database

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

Trusted Sources
```bash
mysql -h <db-host> -P 25060 -u doadmin -p < backend/schema.sql
```

## Step 6: Update Spotify Redirect URI

1. Once deployed, get your backend URL from App Platform (e.g., `https://backend-xxxxx.ondigitalocean.app`)
2. Update Spotify Developer Dashboard with: `https://backend-xxxxx.ondigitalocean.app/callback`

