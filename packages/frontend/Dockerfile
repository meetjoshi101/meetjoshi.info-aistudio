# Stage 1: Build Angular application
FROM node:20-alpine AS builder

ARG API_URL

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies
RUN npm ci --workspace=packages/shared --workspace=packages/frontend

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend
COPY tsconfig.base.json ./

# Build shared package
RUN npm run build --workspace=packages/shared

# Replace API URL placeholder in environment file
RUN sed -i "s|API_URL_PLACEHOLDER|${API_URL}|g" packages/frontend/src/environments/environment.prod.ts

# Build frontend
RUN npm run build:prod --workspace=packages/frontend

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy custom nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
