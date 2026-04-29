# Deployment Guide: Supabase + Google Cloud Run

This guide walks you through deploying the Meet Joshi Portfolio application using Supabase as the backend and Google Cloud Run for hosting.

---

## 📋 Prerequisites

- **Supabase Account**: [Sign up at supabase.com](https://supabase.com)
- **Google Cloud Platform Account**: [Sign up at cloud.google.com](https://cloud.google.com)
- **Docker**: Installed locally for building containers
- **gcloud CLI**: [Install Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- **Node.js 20+**: For local development

---

## 🗄️ Part 1: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `meetjoshi-portfolio`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see: **"Success. No rows returned"**

### Step 3: Create Storage Buckets

Since storage buckets can't be created via SQL, create them manually:

#### Create `project-images` bucket:
1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name: `project-images`
4. **Public bucket**: ✅ Check this
5. Click **"Create bucket"**

#### Create `blog-images` bucket:
1. Repeat the above steps
2. Name: `blog-images`
3. **Public bucket**: ✅ Check this

#### Set Storage Policies:
Go to **SQL Editor** and run:

```sql
-- Allow public to view images
CREATE POLICY "Public can view project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
  );
```

### Step 4: Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** tab
3. Copy these values:
   - **Project URL**: `https://[PROJECT_REF].supabase.co`
   - **anon public key**: `eyJ...` (long JWT token)

### Step 5: Verify Database Setup

Run this query in SQL Editor to verify sample data was inserted:

```sql
SELECT * FROM projects;
SELECT * FROM blog_posts;
```

You should see 2 projects and 2 blog posts.

---

## 🔧 Part 2: Local Development Setup

### Step 1: Update Environment Files

Edit `apps/frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY'
};
```

Edit `apps/frontend/src/environments/environment.prod.ts` with the same values.

### Step 2: Test Locally

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:4200
```

**Verify**:
- Projects page shows 2 sample projects
- Blog page shows 2 sample posts
- Data source indicator shows "Supabase"

---

## 🐳 Part 3: Docker Setup

### Step 1: Build Docker Image Locally

```bash
npm run docker:build
```

This creates a Docker image named `meetjoshi-portfolio:latest`.

### Step 2: Test Docker Container Locally

```bash
npm run docker:run
```

Open browser to `http://localhost:8080` and verify the app works.

**Stop the container**:
```bash
docker ps  # Find the container ID
docker stop [CONTAINER_ID]
```

---

## ☁️ Part 4: Google Cloud Run Deployment

### Step 1: Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create meetjoshi-portfolio --name="Meet Joshi Portfolio"

# Set as active project
gcloud config set project meetjoshi-portfolio

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.gcr.io
```

### Step 2: Configure Docker for GCR

```bash
# Configure Docker to authenticate with Google Container Registry
gcloud auth configure-docker
```

### Step 3: Build and Push to Google Container Registry

**Option A: Using Cloud Build (Recommended)**
```bash
# Replace PROJECT_ID with your actual project ID
gcloud builds submit --tag gcr.io/meetjoshi-portfolio/meetjoshi-portfolio
```

**Option B: Build locally and push**
```bash
# Build for GCR
docker build -t gcr.io/meetjoshi-portfolio/meetjoshi-portfolio:latest .

# Push to GCR
docker push gcr.io/meetjoshi-portfolio/meetjoshi-portfolio:latest
```

### Step 4: Deploy to Cloud Run

**Method 1: Using gcloud CLI (Recommended)**

```bash
gcloud run deploy meetjoshi-portfolio \
  --image gcr.io/meetjoshi-portfolio/meetjoshi-portfolio:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co,SUPABASE_ANON_KEY=YOUR_ANON_KEY \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

**Method 2: Using cloudrun.yaml**

1. Edit `cloudrun.yaml`:
   - Replace `PROJECT_ID` with your GCP project ID
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`

2. Deploy:
```bash
gcloud run services replace cloudrun.yaml
```

### Step 5: Get Your Deployment URL

After deployment completes, you'll see:

```
Service [meetjoshi-portfolio] revision [meetjoshi-portfolio-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://meetjoshi-portfolio-xxxxx-uc.a.run.app
```

Copy this URL and visit it in your browser!

---

## 🤖 Part 5: Automated CI/CD with GitHub Actions

**⚡ Recommended for automatic deployments!**

Instead of manually deploying, set up GitHub Actions for automatic deployments on every push to `main`.

### Quick Setup

1. **Follow the detailed setup guide**: `.github/SETUP.md`

2. **Add GitHub Secrets** (Required):
   - `GCP_PROJECT_ID` - Your Google Cloud project ID
   - `GCP_SA_KEY` - Service account JSON key
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key

3. **Push to main branch** - Deployment happens automatically!

### What You Get

✅ **Automatic deployments** on push to `main`
✅ **PR validation** with Docker build tests
✅ **Deployment summaries** with service URL
✅ **Manual triggers** via GitHub UI
✅ **Build caching** for faster deployments

### Workflows Included

- **`deploy.yml`** - Builds, pushes to GCR, deploys to Cloud Run
- **`pr-validation.yml`** - Validates PRs before merge

**📖 Full documentation**: See `.github/SETUP.md` for complete setup instructions

---

## 📊 Part 6: Monitoring & Maintenance

### View Logs

```bash
# View recent logs
gcloud run services logs read meetjoshi-portfolio --region us-central1 --limit 50

# Follow logs in real-time
gcloud run services logs tail meetjoshi-portfolio --region us-central1
```

### Update Environment Variables

```bash
gcloud run services update meetjoshi-portfolio \
  --region us-central1 \
  --set-env-vars SUPABASE_URL=NEW_VALUE
```

### Scale Configuration

```bash
gcloud run services update meetjoshi-portfolio \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20
```

### Monitor Costs

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to **Billing** → **Reports**
- Set budget alerts

---

## 🔒 Part 7: Custom Domain (Optional)

### Step 1: Verify Domain Ownership

```bash
gcloud domains verify meetjoshi.com
```

### Step 2: Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service meetjoshi-portfolio \
  --domain meetjoshi.com \
  --region us-central1
```

### Step 3: Update DNS Records

Add the DNS records provided by GCP to your domain registrar.

---

## 🐛 Troubleshooting

### Issue: "Error fetching projects"

**Solution**: Check environment variables are set correctly:
```bash
gcloud run services describe meetjoshi-portfolio --region us-central1 --format="value(spec.template.spec.containers[0].env)"
```

### Issue: "CORS errors"

**Solution**: Supabase allows all origins by default. If you encounter CORS issues, check Supabase Dashboard → Settings → API → CORS.

### Issue: "Build fails in Docker"

**Solution**: Test build locally first:
```bash
npm run build:prod
```

Check for TypeScript errors or missing dependencies.

### Issue: "Database connection fails"

**Solution**:
1. Verify RLS policies are set correctly
2. Check the anon key has proper permissions
3. Ensure `published = true` on test data

---

## 📚 Useful Commands

```bash
# Local development
npm run dev                    # Start dev server
npm run build:prod             # Production build
npm run docker:build-run       # Build and run in Docker

# Docker operations
docker ps                      # List running containers
docker logs [CONTAINER_ID]     # View container logs
docker exec -it [ID] sh        # Access container shell

# Google Cloud
gcloud projects list           # List all projects
gcloud run services list       # List all services
gcloud run services delete [NAME]  # Delete a service

# Supabase
# All operations done via Dashboard or SQL Editor
```

---

## 🎉 Deployment Checklist

- [x] Supabase project created
- [x] Database schema migrated
- [x] Storage buckets created
- [x] Environment variables configured
- [x] Tested locally
- [x] Docker image built successfully
- [x] Deployed to Cloud Run
- [x] Verified production URL works
- [ ] (Optional) Custom domain configured
- [ ] (Optional) CI/CD pipeline set up
- [ ] (Optional) Monitoring alerts configured

---

## 📞 Support

For issues with:
- **Supabase**: [Supabase Discord](https://discord.supabase.com)
- **Google Cloud Run**: [GCP Support](https://cloud.google.com/support)
- **Application Code**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0
