# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with **Angular 21** using Vite as the build tool. It features a public-facing portfolio site with projects and blog posts, plus an authenticated admin panel for content management. The backend is powered by **Supabase** (PostgreSQL database, authentication, and storage).

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Production build
npm run build:prod       # Production build (explicit)
npm run preview          # Serve production build locally
```

### Docker (Local Testing)
```bash
npm run docker:build     # Build Docker image
npm run docker:run       # Run container on http://localhost:8080
npm run docker:build-run # Build and run in sequence
```

### Google Cloud Platform Deployment
```bash
npm run gcp:build        # Build and push to GCR (update PROJECT_ID first)
npm run gcp:deploy       # Deploy to Cloud Run (update PROJECT_ID first)
```

Note: Replace `PROJECT_ID` in package.json scripts with your actual GCP project ID before using these commands.

## Architecture

### Frontend Stack
- **Framework**: Angular 21 with standalone components (no NgModules)
- **Routing**: File-based routing via `src/app.routes.ts`
- **Build Tool**: Vite (via @angular/build)
- **Styling**: Tailwind CSS
- **Rich Text Editor**: EditorJS with multiple plugins (header, list, image, quote, code, table, embed, link)

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Tables**: `projects`, `blog_posts`
- **Storage Buckets**: `project-images` (public), `blog-images` (public)
- **Authentication**: Supabase Auth (email/password)
- **Security**: Public read access for published content; authenticated write/update/delete

### Key Services
1. **SupabaseService** (`src/services/supabase.service.ts`): Core Supabase client initialization, image upload/delete
2. **AuthService** (`src/services/auth.service.ts`): Authentication state management using Angular signals
3. **DataService** (`src/services/data.service.ts`): CRUD operations for projects and blog posts
4. **EditorJSService** (`src/services/editorjs.service.ts`): Rich text editor configuration with Supabase image uploads
5. **ThemeService** (`src/services/theme.service.ts`): Dark/light mode management

### Route Structure
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
Both `projects.content` and `blog_posts.content` use **EditorJS OutputData format** (JSON). When displaying, use the BlockRendererComponent (`src/components/block-renderer.component.ts`) to render EditorJS blocks as HTML.

## Environment Configuration

### Development
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### Production
Edit `src/environments/environment.prod.ts` with the same structure.

For **Docker builds**, the Dockerfile replaces placeholders using `sed` with build arguments:
```dockerfile
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
RUN sed -i "s|YOUR_SUPABASE_URL|${SUPABASE_URL}|g" src/environments/environment.prod.ts
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
- `GCP_PROJECT_ID`: Google Cloud project ID
- `GCP_SA_KEY`: Service account JSON key (for GCR and Cloud Run)

### Workflows
- `.github/workflows/deploy.yml`: Auto-deploy to Cloud Run on push to `main`
- `.github/workflows/pr-validation.yml`: Validate Docker build on PRs

## Common Development Patterns

### Adding a New Admin Page
1. Create component in `src/pages/admin/`
2. Add route to `src/app.routes.ts` under the admin children array
3. Ensure route uses `canActivate: [authGuard]` (inherited from parent)

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

## Deployment Architecture

### Local Development
Angular dev server → Supabase (via environment.ts credentials)

### Production (Cloud Run)
1. GitHub Actions triggered by push to `main`
2. Docker build with Supabase credentials injected via build args
3. Image pushed to Google Container Registry
4. Deployed to Cloud Run with NGINX serving static Angular build
5. Cloud Run URL: `https://meetjoshi-portfolio-xxxxx-uc.a.run.app`

### Docker Container
- Base: `node:20-alpine` (build stage), `nginx:alpine` (runtime)
- Angular build output → `/usr/share/nginx/html`
- NGINX config: `nginx.conf` (SPA routing fallback to index.html)
- Port: 8080
