# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy configuration
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY local-packages ./local-packages

# Build the application
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/local-packages ./local-packages

# Install ONLY production dependencies
RUN npm ci --only=production

# Environment Defaults
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "start"]
