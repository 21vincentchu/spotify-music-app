# Multi-stage build: First build React app
FROM node:18-alpine AS frontend-build

WORKDIR /frontend

# Copy frontend package files and install dependencies
COPY frontend/reverb-client/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/reverb-client/ ./
RUN npm run build

# Second stage: Python backend
FROM python:3.13-slim

# Set working directory in container
WORKDIR /app

# Copy requirements first (for better caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code from backend directory
COPY backend/ .

# Copy built React app from frontend-build stage
COPY --from=frontend-build /frontend/build ./frontend/reverb-client/build

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the Flask app
CMD ["python", "app.py"]
