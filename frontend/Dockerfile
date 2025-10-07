# FROM node:18-slim

# WORKDIR /reverb-client

# # Copy package files if they exist
# COPY package*.json ./

# # Install dependencies if package.json exists
# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]
FROM node:18-alpine

WORKDIR /app

# Copy the package files from the correct path
COPY reverb-client/package*.json ./
RUN npm install

# Copy the rest of the React source
COPY reverb-client ./

EXPOSE 3000
CMD ["npm", "start"]

