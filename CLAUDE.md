# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built as an **Nx monorepo** with Angular 21 frontend, Express.js backend, and a shared TypeScript library. The frontend features a public-facing portfolio site with projects and blog posts, plus an authenticated admin panel for content management. The backend is an Express API powered by **Supabase** (PostgreSQL database, authentication, and storage).

## Nx Monorepo Structure

This project uses Nx for efficient monorepo management with smart builds and computation caching.

```
/
├── apps/
│   ├── frontend/          # Angular 21 application
│   └── backend/           # Express.js API
├── libs/
│   └── shared/            # Shared TypeScript types/utilities
├── nx.json                # Nx workspace configuration
└── package.json           # Root package.json with workspaces
```

## Development Commands

### Local Development

```bash
# Install dependencies
npm install

# Run both frontend and backend in parallel
npm run dev

# Run individually
npm run dev:frontend       # Angular on http://localhost:3000
npm run dev:backend        # Express on http://localhost:3001

# Build all projects
npm run build

# Build specific projects
npm run build:frontend
npm run build:backend
npm run build:shared

# Test all projects
npm run test

# Nx affected commands (smart builds)
npm run affected:build     # Build only affected projects
npm run affected:test      # Test only affected projects
npm run affected:lint      # Lint only affected projects

# View dependency graph
npm run graph
```

### Docker (Local Testing)

```bash
npm run docker:build-frontend    # Build frontend image
npm run docker:build-backend     # Build backend image
npm run docker:build-all         # Build both images
```

### Nx-Specific Commands

```bash
# Run target for specific project
npx nx [target] [project]
# Examples:
npx nx serve frontend
npx nx build backend
npx nx test shared

# Run target for all projects
npx nx run-many -t [target] --all
# Examples:
npx nx run-many -t build --all
npx nx run-many -t test --all

# Run target for affected projects only
npx nx affected -t [target]
# Examples:
npx nx affected -t build
npx nx affected -t test --base=origin/main

# View project graph
npx nx graph
```

Note: When making changes, Nx will automatically determine which projects are affected and only rebuild/retest those projects, saving significant time.

## Architecture

### Frontend Stack (`apps/frontend`)
- **Framework**: Angular 21 with standalone components (no NgModules)
- **Routing**: File-based routing via `src/app.routes.ts`
- **Build Tool**: Vite (via @angular/build)
- **Styling**: Tailwind CSS
- **Rich Text Editor**: EditorJS with multiple plugins (header, list, image, quote, code, table, embed, link)

### Backend Stack (`apps/backend`)
- **Framework**: Express.js
- **Runtime**: Node.js 20
- **Build**: TypeScript compiler
- **Database Client**: Supabase JS client
- **Middleware**: CORS, Helmet, Morgan, Express Validator

### Shared Library (`libs/shared`)
- **Purpose**: Common TypeScript types and utilities shared between frontend and backend
- **Build**: TypeScript compiler
- **Exports**: Type definitions, interfaces, constants

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Tables**: `projects`, `blog_posts`
- **Storage Buckets**: `project-images` (public), `blog-images` (public)
- **Authentication**: Supabase Auth (email/password)
- **Security**: Public read access for published content; authenticated write/update/delete

### Key Services (Frontend)
1. **SupabaseService** (`apps/frontend/src/services/supabase.service.ts`): Core Supabase client initialization, image upload/delete
2. **AuthService** (`apps/frontend/src/services/auth.service.ts`): Authentication state management using Angular signals
3. **DataService** (`apps/frontend/src/services/data.service.ts`): CRUD operations for projects and blog posts
4. **EditorJSService** (`apps/frontend/src/services/editorjs.service.ts`): Rich text editor configuration with Supabase image uploads
5. **ThemeService** (`apps/frontend/src/services/theme.service.ts`): Dark/light mode management

### Route Structure (Frontend)
```
/                        # Home page
/projects                # Projects list
/projects/:id            # Project details (uses slug)
/blog                    # Blog posts list
/blog/:id                # Blog post details (uses slug)
/about                   # About page
/contact                 # Contact page

/admin/login             # Admin login (public)
/admin/*                 # Admin panel (protected by authGuard)
  /admin                 # Dashboard
  /admin/projects        # Manage projects
  /admin/projects/new    # Create project
  /admin/projects/edit/:id # Edit project
  /admin/blog            # Manage blog posts
  /admin/blog/new        # Create blog post
  /admin/blog/edit/:id   # Edit blog post
```

### API Routes (Backend)
```
GET  /api/health         # Health check
GET  /api/projects       # List all published projects
GET  /api/projects/:id   # Get project by ID/slug
GET  /api/blog           # List all published blog posts
GET  /api/blog/:id       # Get blog post by ID/slug
```

## Database Schema

### projects table
- `id` (UUID, PK), `slug` (unique), `title`, `client`, `year`, `description`, `category`
- `technologies` (text array), `image_url`, `challenge`, `solution`, `outcome`
- `content` (EditorJS JSON), `published` (boolean), `created_at`, `updated_at`

### blog_posts table
- `id` (UUID, PK), `slug` (unique), `title`, `excerpt`, `content` (EditorJS JSON)
- `date`, `category`, `read_time`, `image_url`, `author`
- `gallery_images` (text array), `published` (boolean), `created_at`, `updated_at`

### Content Field Format
Both `projects.content` and `blog_posts.content` use **EditorJS OutputData format** (JSON). When displaying, use the BlockRendererComponent (`apps/frontend/src/components/block-renderer.component.ts`) to render EditorJS blocks as HTML.

## Environment Configuration

### Frontend Development
Edit `apps/frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### Frontend Production
Edit `apps/frontend/src/environments/environment.prod.ts` with the same structure.

### Backend Development
Create `apps/backend/.env`:
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
FRONTEND_URL=http://localhost:3000
```

### Docker Builds
Dockerfiles use build arguments to inject environment variables:
```dockerfile
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
RUN sed -i "s|YOUR_SUPABASE_URL|${SUPABASE_URL}|g" apps/frontend/src/environments/environment.prod.ts
```

## Supabase Setup

### Initial Setup
1. Create Supabase project at https://app.supabase.com
2. Run migration: `supabase/migrations/001_initial_schema.sql` via SQL Editor
3. Manually create storage buckets (cannot be created via SQL):
   - `project-images` (public)
   - `blog-images` (public)
4. Apply storage policies (see migration file comments)
5. Copy Supabase URL and anon key to environment files

### Authentication
- Admin users must be created manually in Supabase Dashboard (Authentication > Users)
- No public signup functionality (sign-in only)
- Auth state persists via Supabase session storage

### RLS Policies
- **Public**: Can SELECT published content (`published = true`)
- **Authenticated**: Can INSERT, UPDATE, DELETE all content

## CI/CD (GitHub Actions)

### Required GitHub Secrets
Set these at `Settings > Secrets and variables > Actions`:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (backend only)
- `GCP_PROJECT_ID`: Google Cloud project ID
- `GCP_SA_KEY`: Service account JSON key (for GCR and Cloud Run)
- `BACKEND_API_URL`: Backend URL for frontend to connect to
- `FRONTEND_URL`: Frontend URL for backend CORS

### Workflows
- `.github/workflows/deploy-frontend.yml`: Auto-deploy frontend to Cloud Run on push to `main` (only when `apps/frontend/**` or `libs/shared/**` changes)
- `.github/workflows/deploy-backend.yml`: Auto-deploy backend to Cloud Run on push to `main` (only when `apps/backend/**` or `libs/shared/**` changes)
- `.github/workflows/pr-validation.yml`: Run Nx affected builds/tests/lints on PRs

All workflows use Nx affected commands to optimize build times by only building/testing changed projects.

## Common Development Patterns

### Adding a New Frontend Page
1. Create component in `apps/frontend/src/pages/`
2. Add route to `apps/frontend/src/app.routes.ts`
3. Ensure route uses `canActivate: [authGuard]` if admin-only

### Adding a New Backend Endpoint
1. Create route handler in `apps/backend/src/routes/`
2. Register route in `apps/backend/src/server.ts`
3. Add middleware as needed (auth, validation, etc.)

### Working with Shared Types
1. Define types in `libs/shared/src/types/`
2. Export from `libs/shared/src/index.ts`
3. Import in frontend: `import { Type } from '@meetjoshi/shared'`
4. Import in backend: `import { Type } from '@meetjoshi/shared'`
5. Run `npm run build:shared` to rebuild after changes

### Working with EditorJS Content
- **Creating/Editing**: Use `EditorJSService.createEditorConfig()` to initialize editor
- **Saving**: Call `editor.save()` to get OutputData JSON, store in `content` field
- **Displaying**: Use `BlockRendererComponent` with `[blocks]` input to render HTML

### Uploading Images
- **Admin Forms**: Use `SupabaseService.uploadImage(bucket, file, path)` directly
- **EditorJS Images**: Automatically handled by EditorJSService via Image tool uploader
- Set correct bucket with `EditorJSService.setImageBucket('project-images' | 'blog-images')`

### Working with Slugs
- Projects and blog posts use `slug` for URLs (not `id`)
- Slugs must be unique (enforced by database constraint)
- DataService queries by slug: `getProjectBySlug(slug)`, `getBlogPostBySlug(slug)`

## Nx Project Configuration

Each project has a `project.json` file that defines:
- **name**: Project identifier
- **targets**: Available commands (build, serve, test, lint)
- **tags**: Organizational tags (type:app, type:lib, scope:frontend, etc.)

Example target configuration:
```json
{
  "build": {
    "executor": "@nx/vite:build",
    "outputs": ["{options.outputPath}"],
    "options": {
      "outputPath": "apps/frontend/dist"
    }
  }
}
```

Nx uses these configurations to:
1. Determine build order based on dependencies
2. Cache build outputs for unchanged projects
3. Run only affected projects when using affected commands

## Deployment Architecture

### Local Development
- Frontend dev server (http://localhost:3000) → Supabase
- Backend dev server (http://localhost:3001) → Supabase
- Both use environment-specific configurations

### Production (Cloud Run)
1. GitHub Actions triggered by push to `main`
2. Nx determines which projects are affected
3. Docker builds only for affected apps
4. Images pushed to Google Container Registry
5. Deployed to Cloud Run with NGINX (frontend) or Node.js (backend)
6. Frontend URL: `https://meetjoshi-frontend-xxxxx-uc.a.run.app`
7. Backend URL: `https://meetjoshi-backend-xxxxx-uc.a.run.app`

### Docker Containers

#### Frontend
- Base: `node:20-alpine` (build stage), `nginx:alpine` (runtime)
- Build: Nx builds shared lib, then frontend with Vite
- Runtime: NGINX serves static Angular build
- Port: 8080

#### Backend
- Base: `node:20-alpine` (build and runtime)
- Build: Nx builds shared lib, then backend with tsc
- Runtime: Node.js runs compiled Express server
- Port: 8080

## Nx Benefits for This Project

1. **Smart Builds**: When you change only the backend, frontend doesn't rebuild
2. **Shared Code**: `libs/shared` provides type safety across frontend and backend
3. **Task Dependencies**: Shared lib always builds before apps that depend on it
4. **Caching**: Build results are cached and reused when code hasn't changed
5. **Affected Commands**: CI only tests/builds projects affected by PR changes
6. **Visualization**: `npm run graph` shows project dependencies visually
