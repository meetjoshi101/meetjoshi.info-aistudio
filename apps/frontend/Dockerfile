# Stage 1: Build Angular application
FROM node:20-alpine AS builder

ARG API_URL

WORKDIR /app

# Copy root package files and nx configuration
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY libs/shared/package*.json ./libs/shared/
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Copy source code
COPY libs/shared ./libs/shared
COPY apps/frontend ./apps/frontend

# Build using Nx
RUN npx nx build shared
RUN npx nx build frontend --configuration=production

# Replace API URL placeholder in environment file
RUN if [ -f apps/frontend/src/environments/environment.prod.ts ]; then \
        sed -i "s|API_URL_PLACEHOLDER|${API_URL}|g" apps/frontend/src/environments/environment.prod.ts; \
    fi

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy custom nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
