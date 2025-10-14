// API configuration for frontend
const config = {
  // In production, this will be set by DigitalOcean App Platform
  // In development, defaults to local backend
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
};

export default config;
