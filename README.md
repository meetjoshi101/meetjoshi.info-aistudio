# Portfolio Website with Admin Panel

A modern personal portfolio website built with Angular 21 and Supabase, featuring a public-facing portfolio site and an authenticated admin panel for content management.

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
  - Angular 21 with standalone components
  - Vite for fast builds
  - Tailwind CSS for styling
  - Supabase for backend (PostgreSQL, Auth, Storage)
  - Row Level Security (RLS) for data protection
  - EditorJS for rich content editing
  - Docker containerization
  - Cloud Run deployment ready

## Tech Stack

### Frontend
- **Framework**: Angular 21 (standalone components)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Rich Text Editor**: EditorJS with plugins (header, list, image, quote, code, table, embed, link)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

## Prerequisites

- Node.js 20 or higher
- npm or yarn
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

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Update `src/environments/environment.prod.ts` with the same credentials for production.

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Docker (Local Testing)
npm run docker:build     # Build Docker image
npm run docker:run       # Run container on port 8080
npm run docker:build-run # Build and run in sequence

# Google Cloud Platform (Update PROJECT_ID in package.json first)
npm run gcp:build        # Build and push to GCR
npm run gcp:deploy       # Deploy to Cloud Run
```

## Project Structure

```
src/
├── pages/                    # Route components
│   ├── admin/               # Admin panel pages
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── projects/
│   │   └── blog/
│   ├── home/
│   ├── projects/
│   ├── blog/
│   ├── about/
│   └── contact/
├── components/              # Reusable components
│   ├── navbar/
│   ├── footer/
│   ├── project-card/
│   ├── blog-card/
│   └── block-renderer/     # EditorJS content renderer
├── services/                # Angular services
│   ├── supabase.service.ts # Supabase client
│   ├── auth.service.ts     # Authentication
│   ├── data.service.ts     # CRUD operations
│   ├── editorjs.service.ts # Rich text editor
│   └── theme.service.ts    # Dark/light mode
├── guards/
│   └── auth.guard.ts       # Route protection
└── environments/            # Environment configs

supabase/
└── migrations/              # Database migrations
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

### Docker

Build and run locally:

```bash
docker build \
  --build-arg SUPABASE_URL=your_url \
  --build-arg SUPABASE_ANON_KEY=your_key \
  -t portfolio .
docker run -p 8080:8080 portfolio
```

### Google Cloud Run

1. Set GitHub secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY`

2. Push to `main` branch - GitHub Actions will:
   - Build Docker image with credentials
   - Push to Google Container Registry
   - Deploy to Cloud Run

## CI/CD

- `.github/workflows/deploy.yml`: Auto-deploy on push to `main`
- `.github/workflows/pr-validation.yml`: Validate builds on PRs

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

For detailed development guidelines and architectural decisions, see [CLAUDE.md](CLAUDE.md).

## License

Private portfolio project.
