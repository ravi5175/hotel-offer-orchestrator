# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "start:prod"]
