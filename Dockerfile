# Multi-stage build: Build React frontend, then run Flask backend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/reverb-client/package*.json ./
RUN npm install
COPY frontend/reverb-client/ ./
RUN npm run build

# Stage 2: Python backend with built frontend
FROM python:3.13-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (updated with debug logging)
COPY backend/ .

# Copy built React frontend
COPY --from=frontend-build /app/build ./frontend_build

EXPOSE 8080

ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=8080

CMD ["python", "app.py"]
