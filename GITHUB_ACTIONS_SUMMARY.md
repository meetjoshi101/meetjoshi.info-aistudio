# GitHub Actions CI/CD - Quick Reference

## 🎯 What Was Created

### Workflow Files

1. **`.github/workflows/deploy.yml`** - Production Deployment
   - Triggers: Push to `main` branch or manual
   - Actions: Build → Push to GCR → Deploy to Cloud Run
   - Duration: ~3-5 minutes

2. **`.github/workflows/pr-validation.yml`** - PR Testing
   - Triggers: Pull requests to `main` branch
   - Actions: Build Docker → Test container health → Report size
   - Duration: ~2-3 minutes

### Documentation

3. **`.github/SETUP.md`** - Complete setup guide (500+ lines)
   - Service account creation
   - IAM roles configuration
   - GitHub Secrets setup
   - Troubleshooting guide

4. **`DEPLOYMENT.md`** - Updated with GitHub Actions section

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create GCP Service Account (2 min)

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer" \
    --project=$PROJECT_ID

# Grant required permissions
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# Create JSON key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# Copy the contents (you'll need this for GitHub)
cat github-actions-key.json
```

### Step 2: Add GitHub Secrets (2 min)

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these 4 secrets:

| Name | Value | Where to Get |
|------|-------|--------------|
| `GCP_PROJECT_ID` | `your-project-id` | Run: `gcloud config get-value project` |
| `GCP_SA_KEY` | `{...json content...}` | Contents of `github-actions-key.json` |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API |

### Step 3: Enable GCP APIs (1 min)

```bash
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID
```

### Step 4: Test It! (Manual Trigger)

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **"Deploy to Cloud Run"** workflow
4. Click **"Run workflow"**
5. Select branch: `main`
6. Click **"Run workflow"** button

Watch the deployment happen! ⏱️ ~3-5 minutes

---

## 📋 Workflow Details

### Deploy Workflow (`deploy.yml`)

```yaml
Triggers:
  - Push to main branch
  - Manual dispatch (via GitHub UI)

Steps:
  1. ✅ Checkout code
  2. ✅ Setup Google Cloud SDK
  3. ✅ Configure Docker for GCR
  4. ✅ Build Docker image (tagged with commit SHA + latest)
  5. ✅ Push to Google Container Registry
  6. ✅ Deploy to Cloud Run
  7. ✅ Output service URL
  8. ✅ Create deployment summary

Environment Variables Injected:
  - SUPABASE_URL (from secrets)
  - SUPABASE_ANON_KEY (from secrets)

Resource Configuration:
  - Memory: 512Mi
  - CPU: 1
  - Min Instances: 0 (scale to zero)
  - Max Instances: 10
  - Timeout: 300s
```

### PR Validation Workflow (`pr-validation.yml`)

```yaml
Triggers:
  - Pull requests to main branch
  - Manual dispatch

Steps:
  1. ✅ Checkout code
  2. ✅ Setup Node.js 20
  3. ✅ Install dependencies
  4. ✅ TypeScript type check
  5. ✅ Build Docker image
  6. ✅ Test container (start + HTTP check)
  7. ✅ Report image size
  8. ✅ Create validation summary

Prevents:
  - Broken builds from being merged
  - TypeScript errors
  - Docker build failures
  - Container startup issues
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Use service account with minimal required roles
- Store all sensitive data in GitHub Secrets
- Enable branch protection rules
- Review workflow logs regularly
- Rotate service account keys periodically

### ❌ DON'T:
- Commit service account keys to repository
- Use owner/editor roles (too permissive)
- Hardcode secrets in workflow files
- Push directly to main without PR validation
- Share `GCP_SA_KEY` secret outside GitHub

---

## 📊 What Happens on Each Push

### 1. Developer Workflow

```
Developer creates feature branch
    ↓
Makes code changes
    ↓
Creates Pull Request to main
    ↓
🤖 PR Validation Workflow runs automatically
    ├─ Builds Docker image
    ├─ Tests container health
    └─ Reports success/failure
    ↓
Code review + approval
    ↓
Merge to main
    ↓
🚀 Deploy Workflow triggers automatically
    ├─ Builds production image
    ├─ Pushes to GCR
    ├─ Deploys to Cloud Run
    └─ Reports service URL
    ↓
✅ Live on Cloud Run!
```

### 2. Deployment Timeline

```
0:00 - Workflow triggered
0:05 - Code checked out
0:10 - GCP SDK configured
0:15 - Docker build starts
1:30 - Docker build complete
2:00 - Pushing to GCR
2:45 - Push complete
3:00 - Deploying to Cloud Run
4:00 - Deployment complete
4:05 - Service URL available
```

### 3. Cost Per Deployment

```
Cloud Run deployment: $0.00 (first 2M requests free)
Container Registry storage: ~$0.01/month (per image)
Cloud Build (if used): $0.003 per build minute

Estimated monthly cost (10 deploys/month): < $1.00
```

---

## 🎛️ Customization Options

### Change Region

Edit `.github/workflows/deploy.yml`:

```yaml
env:
  REGION: europe-west1  # Change from us-central1
```

### Adjust Resources

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      --memory 1Gi \        # 256Mi, 512Mi, 1Gi, 2Gi, 4Gi
      --cpu 2 \             # 1, 2, 4
      --min-instances 1 \   # 0 (scale to zero), 1, 2, ...
      --max-instances 50 \  # Max concurrent instances
```

### Deploy on Tags (Release Workflow)

Add to `deploy.yml`:

```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # Trigger on version tags (v1.0.0)
```

### Add Slack Notifications

Add at end of `deploy.yml`:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📈 Monitoring Your Deployments

### View Deployment Status

**GitHub UI:**
1. Go to **Actions** tab
2. Click on latest workflow run
3. Expand each step to see logs

**Command Line:**
```bash
# Install GitHub CLI
gh auth login

# List recent runs
gh run list --workflow=deploy.yml

# View specific run
gh run view [RUN_ID] --log

# Watch a running deployment
gh run watch
```

### View Cloud Run Logs

```bash
# Recent logs
gcloud run services logs read meetjoshi-portfolio \
  --region us-central1 \
  --limit 50

# Follow logs in real-time
gcloud run services logs tail meetjoshi-portfolio \
  --region us-central1

# Filter by severity
gcloud run services logs read meetjoshi-portfolio \
  --region us-central1 \
  --log-filter="severity>=ERROR"
```

### Check Deployment Health

```bash
# Get service details
gcloud run services describe meetjoshi-portfolio \
  --region us-central1 \
  --format yaml

# Check traffic split (for blue/green deployments)
gcloud run services describe meetjoshi-portfolio \
  --region us-central1 \
  --format="value(status.traffic)"

# Test the endpoint
SERVICE_URL=$(gcloud run services describe meetjoshi-portfolio \
  --region us-central1 \
  --format="value(status.url)")
curl -I $SERVICE_URL
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" in workflow

**Cause**: Service account missing required roles

**Solution**:
```bash
# Verify roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@"

# Re-add missing roles (see Step 1 above)
```

### Issue: "API not enabled"

**Solution**:
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Issue: Workflow runs but deployment fails

**Check**:
1. Environment variables correct? (Supabase URL/key)
2. GCP project ID matches `GCP_PROJECT_ID` secret?
3. Cloud Run service name available in region?

**Debug**:
```bash
# Check if service exists
gcloud run services list --region us-central1

# View revision logs
gcloud run revisions list \
  --service meetjoshi-portfolio \
  --region us-central1
```

### Issue: Container builds but won't start

**Cause**: Usually missing environment variables or wrong port

**Solution**: Check Cloud Run logs for startup errors:
```bash
gcloud run services logs read meetjoshi-portfolio \
  --region us-central1 \
  --log-filter="severity>=ERROR"
```

---

## 🎓 Next Steps

### Recommended Improvements

1. **Branch Protection**
   - Settings → Branches → Add rule for `main`
   - ✅ Require PR reviews
   - ✅ Require status checks (PR Validation)
   - ✅ Require branches up to date

2. **Monitoring & Alerts**
   - Set up GCP budget alerts
   - Enable Cloud Run metrics in GCP Console
   - Consider adding Sentry for error tracking

3. **Multi-Environment Setup**
   - Create `staging` environment
   - Separate GCP projects for prod/staging
   - Use environment-specific secrets

4. **Release Management**
   - Tag releases: `git tag v1.0.0`
   - Create release workflow triggered by tags
   - Generate release notes automatically

5. **Performance Monitoring**
   - Enable Cloud Run detailed metrics
   - Set up uptime checks
   - Configure alerting policies

---

## 📞 Getting Help

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Workflow Syntax**: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions

**Created**: 2026-01-07
**Version**: 1.0.0
