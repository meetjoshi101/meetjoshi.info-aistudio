# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and nx configuration
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY libs/shared/package*.json ./libs/shared/
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci

# Copy source code
COPY libs/shared ./libs/shared
COPY apps/backend ./apps/backend

# Build using Nx
RUN npx nx build shared
RUN npx nx build backend

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and nx configuration
COPY package*.json ./
COPY nx.json ./
COPY libs/shared/package*.json ./libs/shared/
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built code
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/libs/shared/package.json ./libs/shared/package.json

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "apps/backend/dist/server.js"]
