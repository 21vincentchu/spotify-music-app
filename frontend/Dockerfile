FROM node:18-slim

WORKDIR /app

# Copy package files from reverb-client subdirectory
COPY reverb-client/package*.json ./

# Install dependencies
RUN npm install

# Copy all application files from reverb-client subdirectory
COPY reverb-client/ .

EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
