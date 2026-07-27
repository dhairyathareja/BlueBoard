# Use official Node.js 22 LTS image
FROM node:22-alpine

# Create application directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose application port
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]