# Portfolio Website with Admin Panel - Nx Monorepo

A modern personal portfolio website built with Angular 21 and Supabase, featuring a public-facing portfolio site and an authenticated admin panel for content management. This project uses Nx for efficient monorepo management, task orchestration, and build caching.

## Features

- **Public Portfolio Site**
  - Projects showcase with detailed case studies
  - Blog with rich text content
  - Responsive design with dark/light mode
  - About and contact pages

- **Admin Panel**
  - Secure authentication via Supabase
  - Create, edit, and manage projects
  - Create, edit, and manage blog posts
  - Rich text editing with EditorJS
  - Image upload and management
  - Draft/publish workflow

- **Technical Highlights**
  - **Nx Monorepo**: Smart build system with computation caching
  - Angular 21 with standalone components
  - Express.js backend API
  - Vite for fast builds
  - Tailwind CSS for styling
  - Supabase for backend (PostgreSQL, Auth, Storage)
  - Row Level Security (RLS) for data protection
  - EditorJS for rich content editing
  - Docker containerization
  - Cloud Run deployment ready

## Tech Stack

### Monorepo
- **Build System**: Nx 22
- **Task Runner**: Nx with intelligent caching
- **Affected Commands**: Build/test only what changed

### Frontend (`apps/frontend`)
- **Framework**: Angular 21 (standalone components)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Rich Text Editor**: EditorJS with plugins (header, list, image, quote, code, table, embed, link)

### Backend (`apps/backend`)
- **Framework**: Express.js
- **Runtime**: Node.js 20
- **Build Tool**: TypeScript Compiler

### Shared Library (`libs/shared`)
- **Purpose**: Shared TypeScript types and utilities
- **Used by**: Frontend and Backend applications

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

## Prerequisites

- Node.js 20 or higher
- npm
- Supabase account (free tier works)
- Docker (optional, for containerized deployment)
- Google Cloud Platform account (optional, for production deployment)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Configuration

1. Create a new project at [Supabase](https://app.supabase.com)
2. Run the migration file `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
3. Create storage buckets manually in Supabase Dashboard:
   - `project-images` (public)
   - `blog-images` (public)
4. Apply storage policies (see migration file for RLS policies)
5. Create an admin user in Supabase Dashboard (Authentication > Users)

### 3. Environment Configuration

#### Frontend
Update `apps/frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Update `apps/frontend/src/environments/environment.prod.ts` with the same credentials for production.

#### Backend
Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
FRONTEND_URL=http://localhost:3000
```

### 4. Run Development Servers

```bash
# Run both frontend and backend in parallel
npm run dev

# Or run individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

## Development Commands

### Nx Commands

```bash
# Run both apps in parallel
npm run dev

# Build all projects
npm run build

# Build specific project
npm run build:frontend
npm run build:backend
npm run build:shared

# Test all projects
npm run test

# Test specific project
npm run test:frontend
npm run test:backend

# Lint all projects
npm run lint

# Nx affected commands (only build/test what changed)
npm run affected:build
npm run affected:test
npm run affected:lint

# View dependency graph
npm run graph
```

### Docker Commands

```bash
# Build Docker images
npm run docker:build-frontend
npm run docker:build-backend
npm run docker:build-all

# Run containers
docker run -p 8080:8080 meetjoshi-frontend:latest
docker run -p 8080:8080 meetjoshi-backend:latest
```

### Google Cloud Platform

```bash
# Update PROJECT_ID in package.json first
npm run gcp:build        # Build and push to GCR
npm run gcp:deploy       # Deploy to Cloud Run
```

## Project Structure

```
/
├── apps/
│   ├── frontend/              # Angular application
│   │   ├── src/
│   │   │   ├── pages/         # Route components
│   │   │   │   ├── admin/     # Admin panel pages
│   │   │   │   ├── home/
│   │   │   │   ├── projects/
│   │   │   │   ├── blog/
│   │   │   │   ├── about/
│   │   │   │   └── contact/
│   │   │   ├── components/    # Reusable components
│   │   │   ├── services/      # Angular services
│   │   │   ├── guards/        # Route guards
│   │   │   └── environments/  # Environment configs
│   │   ├── project.json       # Nx project configuration
│   │   └── Dockerfile
│   │
│   └── backend/               # Express.js API
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Express middleware
│       │   └── server.ts      # Server entry point
│       ├── project.json       # Nx project configuration
│       └── Dockerfile
│
├── libs/
│   └── shared/                # Shared TypeScript library
│       ├── src/
│       │   ├── types/         # Shared type definitions
│       │   └── index.ts       # Public API
│       └── project.json       # Nx project configuration
│
├── nx.json                    # Nx workspace configuration
├── package.json               # Root package.json
└── tsconfig.base.json         # Base TypeScript config
```

## Database Schema

### projects
- Core fields: `id`, `slug`, `title`, `client`, `year`, `description`, `category`
- Content: `technologies[]`, `image_url`, `challenge`, `solution`, `outcome`, `content` (EditorJS JSON)
- Meta: `published`, `created_at`, `updated_at`

### blog_posts
- Core fields: `id`, `slug`, `title`, `excerpt`, `content` (EditorJS JSON)
- Meta: `date`, `category`, `read_time`, `image_url`, `author`, `gallery_images[]`
- Status: `published`, `created_at`, `updated_at`

## Authentication

- Admin access only (no public signup)
- Email/password authentication via Supabase
- Protected routes using Angular auth guard
- Session persistence via Supabase client

Access the admin panel at `/admin/login`

## Deployment

### Environments

This project supports two deployment environments:

- **Development (`dev` branch)** → `meetjoshi-*-dev` Cloud Run services
- **Production (`main` branch)** → `meetjoshi-*` Cloud Run services

📚 **For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Quick Start - Dev Environment

1. **Create dev branch:**
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```

2. **Set GitHub secrets** (see DEPLOYMENT_GUIDE.md for full list)

3. **Deploy to dev:**
   ```bash
   git checkout dev
   git push origin dev  # Automatically deploys to dev environment
   ```

4. **Deploy to production:**
   ```bash
   git checkout main
   git merge dev
   git push origin main  # Automatically deploys to production
   ```

### Docker (Local Testing)

Build and run locally:

```bash
# Frontend
docker build \
  -f apps/frontend/Dockerfile \
  --build-arg SUPABASE_URL=your_url \
  --build-arg SUPABASE_ANON_KEY=your_key \
  -t meetjoshi-frontend .
docker run -p 8080:8080 meetjoshi-frontend

# Backend
docker build \
  -f apps/backend/Dockerfile \
  -t meetjoshi-backend .
docker run -p 8080:8080 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  meetjoshi-backend
```

### Google Cloud Run

**Required GitHub Secrets:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GCP_PROJECT_ID`, `GCP_SA_KEY`
- `BACKEND_API_URL`, `FRONTEND_URL` (production)
- `BACKEND_API_URL_DEV`, `FRONTEND_URL_DEV` (development)

**Deployment Process:**
1. Push to `dev` branch → Deploys to dev environment
2. Test on dev environment
3. Push to `main` branch → Deploys to production

GitHub Actions automatically:
- Run Nx affected builds (only build what changed)
- Build Docker images with credentials
- Push to Google Container Registry
- Deploy to Cloud Run

## CI/CD

### Production Workflows
- `.github/workflows/deploy-frontend.yml`: Auto-deploy frontend on push to `main`
- `.github/workflows/deploy-backend.yml`: Auto-deploy backend on push to `main`

### Development Workflows
- `.github/workflows/deploy-frontend-dev.yml`: Auto-deploy frontend on push to `dev`
- `.github/workflows/deploy-backend-dev.yml`: Auto-deploy backend on push to `dev`

### Validation
- `.github/workflows/pr-validation.yml`: Run Nx affected builds/tests/lints on PRs to `main` or `dev`

All workflows use Nx affected commands to only build/test changed projects for maximum efficiency.

## Nx Benefits

- **Smart Builds**: Only rebuilds affected projects when code changes
- **Computation Caching**: Reuses previous build results for unchanged projects
- **Task Orchestration**: Runs tasks in the correct order with proper dependencies
- **Distributed Caching**: Share cache between CI and local development (optional)
- **Dependency Graph**: Visualize project dependencies with `npm run graph`
- **Affected Commands**: Test only what's affected by your changes

## Content Management

### Working with EditorJS
- Admin forms use EditorJS for rich content editing
- Content is stored as JSON in the database
- Use `BlockRendererComponent` to render content on the frontend
- Images are automatically uploaded to Supabase Storage

### Image Uploads
- Project images: `project-images` bucket
- Blog images: `blog-images` bucket
- EditorJS image tool handles uploads automatically

## Security

- Row Level Security (RLS) on all tables
- Public read access for published content
- Authenticated users can manage all content
- Images stored in public buckets with policy-based access

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Development guidelines and architectural decisions
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide for dev and production environments
- **[NX_MIGRATION_SUMMARY.md](NX_MIGRATION_SUMMARY.md)** - Nx monorepo migration summary and benefits

## License

Private portfolio project.
