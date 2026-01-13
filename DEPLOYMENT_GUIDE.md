# Deployment Guide - Dev & Production Environments

This guide explains how to set up and use the dev and production deployment workflows for the Nx monorepo.

## 🌍 Environments

### Production Environment
- **Branch:** `main`
- **Services:**
  - Frontend: `meetjoshi-frontend` → `https://meetjoshi-frontend-xxxxx-uc.a.run.app`
  - Backend: `meetjoshi-backend` → `https://meetjoshi-backend-xxxxx-uc.a.run.app`
- **Purpose:** Live production site serving real users

### Development Environment
- **Branch:** `dev`
- **Services:**
  - Frontend: `meetjoshi-frontend-dev` → `https://meetjoshi-frontend-dev-xxxxx-uc.a.run.app`
  - Backend: `meetjoshi-backend-dev` → `https://meetjoshi-backend-dev-xxxxx-uc.a.run.app`
- **Purpose:** Testing new features and changes before production deployment

---

## 📋 Required GitHub Secrets

Set these in your GitHub repository at: `Settings > Secrets and variables > Actions > New repository secret`

### Shared Secrets (Both Environments)
```
GCP_PROJECT_ID          - Your Google Cloud project ID
GCP_SA_KEY              - Service account JSON key for Cloud Run deployment
SUPABASE_URL            - Your Supabase project URL
SUPABASE_ANON_KEY       - Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (backend only)
```

### Production-Only Secrets
```
FRONTEND_URL            - Production frontend URL (for backend CORS)
BACKEND_API_URL         - Production backend API URL (for frontend)
```

### Development-Only Secrets
```
FRONTEND_URL_DEV        - Dev frontend URL (for backend CORS)
BACKEND_API_URL_DEV     - Dev backend API URL (for frontend)
```

---

## 🚀 Deployment Workflows

### Automatic Deployments

#### Deploy to Development
Push to the `dev` branch to trigger automatic deployment:

```bash
# Make changes on dev branch
git checkout dev
git add .
git commit -m "feat: add new feature"
git push origin dev
```

This triggers:
- `.github/workflows/deploy-frontend-dev.yml` (if frontend/shared changed)
- `.github/workflows/deploy-backend-dev.yml` (if backend/shared changed)

#### Deploy to Production
Push to the `main` branch to trigger automatic deployment:

```bash
# Merge dev to main after testing
git checkout main
git merge dev
git push origin main
```

This triggers:
- `.github/workflows/deploy-frontend.yml` (if frontend/shared changed)
- `.github/workflows/deploy-backend.yml` (if backend/shared changed)

### Manual Deployments

You can manually trigger deployments from the GitHub Actions UI:
1. Go to `Actions` tab in GitHub
2. Select the workflow (e.g., "Deploy Frontend to Cloud Run (Dev)")
3. Click `Run workflow`
4. Select the branch
5. Click `Run workflow` button

---

## 🔄 Deployment Workflow

### Recommended Development Flow

```
┌─────────────────┐
│  Local Changes  │
└────────┬────────┘
         │
         ├─> Commit & Push to dev branch
         │
         ▼
┌─────────────────────┐
│  Dev Deployment     │  ← Automatic via GitHub Actions
│  (Cloud Run Dev)    │
└─────────┬───────────┘
          │
          ├─> Test features on dev environment
          ├─> Run E2E tests
          ├─> Verify functionality
          │
          ▼
┌─────────────────────┐
│  Create PR to main  │  ← PR validation runs automatically
└─────────┬───────────┘
          │
          ├─> Code review
          ├─> Approve & merge
          │
          ▼
┌─────────────────────┐
│ Production Deploy   │  ← Automatic via GitHub Actions
│ (Cloud Run Prod)    │
└─────────────────────┘
```

### Step-by-Step Process

1. **Develop on dev branch:**
   ```bash
   git checkout dev
   # Make changes
   git add .
   git commit -m "feat: new feature"
   git push origin dev
   ```

2. **Automatic dev deployment happens:**
   - Frontend dev: `meetjoshi-frontend-dev` Cloud Run service
   - Backend dev: `meetjoshi-backend-dev` Cloud Run service

3. **Test on dev environment:**
   - Access the dev frontend URL
   - Test all features thoroughly
   - Run E2E tests if needed

4. **Merge to production:**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

5. **Automatic production deployment happens:**
   - Frontend prod: `meetjoshi-frontend` Cloud Run service
   - Backend prod: `meetjoshi-backend` Cloud Run service

---

## 🔧 Initial Setup

### 1. Create Dev Branch
```bash
git checkout -b dev
git push -u origin dev
```

### 2. Set Up GitHub Secrets

In GitHub repo settings, add all required secrets listed above.

### 3. Deploy Dev Environment for First Time

After setting up secrets, manually trigger the workflows:
1. Go to Actions → "Deploy Backend to Cloud Run (Dev)" → Run workflow (select dev branch)
2. Wait for backend to deploy, note the URL
3. Add backend URL to `BACKEND_API_URL_DEV` secret
4. Go to Actions → "Deploy Frontend to Cloud Run (Dev)" → Run workflow (select dev branch)
5. Wait for frontend to deploy, note the URL
6. Add frontend URL to `FRONTEND_URL_DEV` secret
7. Re-run backend deployment to update CORS with frontend URL

### 4. Configure Branch Protection (Optional)

Protect the `main` branch:
1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable: "Require pull request before merging"
4. Enable: "Require status checks to pass"

---

## 📦 What Gets Deployed

### Frontend Deployment
- **Dockerfile:** `apps/frontend/Dockerfile`
- **Includes:**
  - Angular 21 production build
  - Compiled shared library
  - NGINX server for serving static files
- **Environment Variables:**
  - `SUPABASE_URL` (injected at build time)
  - `SUPABASE_ANON_KEY` (injected at build time)

### Backend Deployment
- **Dockerfile:** `apps/backend/Dockerfile`
- **Includes:**
  - Express.js API compiled with TypeScript
  - Compiled shared library
  - Node.js runtime
- **Environment Variables:**
  - `NODE_ENV` (production/development)
  - `PORT` (8080)
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `FRONTEND_URL` (for CORS)

---

## 🔍 Monitoring Deployments

### View Deployment Status

1. **GitHub Actions:**
   - Go to Actions tab
   - View running/completed workflows
   - Check logs for any errors

2. **Cloud Run Console:**
   - Visit: https://console.cloud.google.com/run
   - View service status, metrics, logs
   - Check deployment history

3. **Service URLs:**
   - Frontend Dev: Check Actions output or Cloud Run console
   - Backend Dev: Check Actions output or Cloud Run console
   - Test health endpoint: `https://backend-url/api/health`

### Common Issues

**Issue:** Deployment fails with authentication error
- **Solution:** Check `GCP_SA_KEY` secret is correctly set with valid service account JSON

**Issue:** Frontend can't connect to backend
- **Solution:** Verify `BACKEND_API_URL_DEV` secret matches actual backend URL

**Issue:** Backend CORS errors
- **Solution:** Update `FRONTEND_URL_DEV` secret with correct frontend URL and redeploy backend

**Issue:** Docker build fails
- **Solution:** Check Dockerfiles are up to date and all dependencies are in package.json

---

## 🧪 Testing Deployments

### Manual Testing
```bash
# Test backend health
curl https://your-backend-dev-url.run.app/api/health

# Test backend projects endpoint
curl https://your-backend-dev-url.run.app/api/projects

# Test frontend (open in browser)
open https://your-frontend-dev-url.run.app
```

### Run E2E Tests Against Dev
```bash
# Update playwright.config.ts baseURL to dev frontend URL
# Then run tests
npm run e2e
```

---

## 💰 Cost Optimization

### Cloud Run Pricing Considerations
- Both dev and prod environments use:
  - **Min instances:** 0 (scale to zero when idle)
  - **Max instances:** 5 (dev), 10 (prod)
  - **Memory:** 512Mi
  - **CPU:** 1

### Development Environment
- Automatically scales to zero when not in use
- Only pay for actual usage during testing
- Consider deleting dev services when not actively developing

### Cleanup Dev Resources (Optional)
```bash
# Delete dev frontend service
gcloud run services delete meetjoshi-frontend-dev --region us-central1

# Delete dev backend service
gcloud run services delete meetjoshi-backend-dev --region us-central1

# Delete dev Docker images
gcloud container images delete gcr.io/PROJECT_ID/meetjoshi-frontend-dev --quiet
gcloud container images delete gcr.io/PROJECT_ID/meetjoshi-backend-dev --quiet
```

---

## 📊 Deployment Comparison

| Feature | Development | Production |
|---------|------------|------------|
| **Branch** | `dev` | `main` |
| **Service Names** | `*-dev` suffix | No suffix |
| **Max Instances** | 5 | 10 |
| **NODE_ENV** | `development` | `production` |
| **Image Tags** | `dev`, `{sha}` | `latest`, `{sha}` |
| **Auto-deploy** | On push to dev | On push to main |
| **Purpose** | Testing | Production users |

---

## 🎯 Best Practices

1. **Always test on dev first** - Never push untested code directly to main
2. **Use PR workflow** - Create PRs from dev to main for code review
3. **Monitor deployments** - Check GitHub Actions logs after each push
4. **Test thoroughly** - Run E2E tests on dev before merging to main
5. **Keep secrets updated** - Update URLs when services are redeployed
6. **Review costs** - Regularly check Cloud Run billing dashboard
7. **Use Nx affected** - Workflows automatically use affected commands for efficiency

---

## 📝 Quick Reference

### Deploy Dev Environment
```bash
git checkout dev
git push origin dev
# Wait for GitHub Actions to complete
# Check Actions tab for deployment URLs
```

### Deploy Production
```bash
git checkout main
git merge dev
git push origin main
# Wait for GitHub Actions to complete
```

### Manual Workflow Trigger
```
GitHub UI → Actions → Select Workflow → Run workflow → Choose branch → Run
```

### View Logs
```
GitHub UI → Actions → Select Workflow Run → View logs
```

---

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Nx Affected Commands](https://nx.dev/nx-api/nx/documents/affected)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** January 13, 2026
**Nx Version:** 22.3.3
**Cloud Platform:** Google Cloud Run
