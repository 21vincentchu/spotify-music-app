FROM node:18-alpine

WORKDIR /app

# Copy the package files (build context is already at repo root)
COPY frontend/reverb-client/package*.json ./
RUN npm install

# Copy the rest of the React source
COPY frontend/reverb-client/ ./

EXPOSE 3000
CMD ["npm", "start"]

