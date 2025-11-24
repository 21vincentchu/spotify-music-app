// API configuration for frontend
const config = {
  // In production, REACT_APP_API_URL is set to empty string (uses relative URLs)
  // In development, REACT_APP_API_URL is undefined (falls back to localhost)
  API_URL: process.env.REACT_APP_API_URL !== undefined ? process.env.REACT_APP_API_URL : 'http://localhost:8000'
};

export default config;
