FROM node:18-slim

WORKDIR /app

# Copy package files if they exist
COPY package*.json ./

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
