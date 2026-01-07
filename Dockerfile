# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

# Accept build arguments for Supabase configuration
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Replace placeholder values in environment.prod.ts with actual values
RUN sed -i "s|YOUR_SUPABASE_URL|${SUPABASE_URL}|g" src/environments/environment.prod.ts && \
    sed -i "s|YOUR_SUPABASE_ANON_KEY|${SUPABASE_ANON_KEY}|g" src/environments/environment.prod.ts

# Build the Angular application for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
