// API configuration for frontend
const config = {
  // In production, REACT_APP_API_URL is set to empty string (uses relative URLs)
  // In development, REACT_APP_API_URL is undefined (falls back to 127.0.0.1)
  API_URL: process.env.REACT_APP_API_URL !== undefined ? process.env.REACT_APP_API_URL : 'http://127.0.0.1:8000'
};

export default config;
