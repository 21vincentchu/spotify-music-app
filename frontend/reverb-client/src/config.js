// API configuration for frontend
const config = {
  // In production, frontend and backend are served from same domain
  // In development, React dev server runs on 3000, Flask on 8000
  API_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000'
};

export default config;
