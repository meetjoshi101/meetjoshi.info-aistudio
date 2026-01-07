# GitHub Actions Setup Guide

This guide explains how to set up GitHub Actions for automatic deployment to Google Cloud Run.

---

## 📋 Prerequisites

Before setting up GitHub Actions, ensure you have:

1. ✅ A Google Cloud Platform (GCP) project
2. ✅ Cloud Run API enabled
3. ✅ A Supabase project with your database configured
4. ✅ Admin access to your GitHub repository

---

## 🔐 Step 1: Create GCP Service Account

### 1.1 Create Service Account

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer" \
    --project=$PROJECT_ID
```

### 1.2 Grant Required Permissions

```bash
# Get service account email
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

# Grant Service Account User role (required to deploy)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# Grant Storage Admin role (for GCR)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# Grant Artifact Registry Writer role (alternative to GCR)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.writer"
```

### 1.3 Create and Download JSON Key

```bash
# Create JSON key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# Display the key (copy this for GitHub Secrets)
cat github-actions-key.json

# IMPORTANT: Delete this file after copying to GitHub
# DO NOT commit this file to your repository
rm github-actions-key.json
```

---

## 🔑 Step 2: Configure GitHub Secrets

Go to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `GCP_PROJECT_ID` | Your GCP Project ID | Found in GCP Console or run `gcloud config get-value project` |
| `GCP_SA_KEY` | Service Account JSON Key | Content of `github-actions-key.json` from Step 1.3 |
| `SUPABASE_URL` | Supabase Project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Anonymous Key | Supabase Dashboard → Settings → API → anon public key |

### How to Add Secrets

1. Click **"New repository secret"**
2. **Name**: Enter the secret name (e.g., `GCP_PROJECT_ID`)
3. **Value**: Paste the corresponding value
4. Click **"Add secret"**
5. Repeat for all 4 secrets

---

## 🚀 Step 3: Enable Required GCP APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com --project=$PROJECT_ID

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID

# Enable Cloud Build API (optional, for gcloud builds submit)
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Enable Artifact Registry API (if using Artifact Registry)
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
```

---

## 📝 Step 4: Update Workflow Configuration (Optional)

If you need to customize the deployment, edit `.github/workflows/deploy.yml`:

### Change Region

```yaml
env:
  REGION: us-central1  # Change to: europe-west1, asia-east1, etc.
```

### Change Service Name

```yaml
env:
  SERVICE_NAME: meetjoshi-portfolio  # Change to your preferred name
```

### Adjust Resources

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      --memory 1Gi \           # Change: 256Mi, 512Mi, 1Gi, 2Gi
      --cpu 2 \                # Change: 1, 2, 4
      --min-instances 1 \      # Change: 0 (scale to zero), 1, 2, etc.
      --max-instances 20 \     # Change based on expected traffic
```

---

## 🔄 Step 5: Test the Workflow

### Automatic Trigger (Recommended)

1. Make a change to your code
2. Commit to a feature branch
3. Create a Pull Request to `main`
4. PR validation workflow runs automatically
5. Merge the PR
6. Deployment workflow triggers automatically

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Deploy to Cloud Run"** workflow
3. Click **"Run workflow"**
4. Select branch (usually `main`)
5. Click **"Run workflow"**

---

## 📊 Step 6: Monitor Deployment

### View Workflow Status

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Expand each step to see detailed logs

### View Deployment Summary

After successful deployment, GitHub Actions creates a summary showing:
- ✅ Service URL
- 🐳 Docker image tag
- 🌍 Region
- ⚙️ Configuration details

### Check Cloud Run Service

```bash
# List all Cloud Run services
gcloud run services list

# Get service details
gcloud run services describe meetjoshi-portfolio \
  --region us-central1 \
  --format yaml

# View recent logs
gcloud run services logs read meetjoshi-portfolio \
  --region us-central1 \
  --limit 50
```

---

## 🔧 Troubleshooting

### Issue: "Permission Denied" Error

**Solution**: Verify service account has all required roles:

```bash
# Check current roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
```

### Issue: "API not enabled"

**Solution**: Enable required APIs (see Step 3)

### Issue: "Invalid credentials"

**Solution**:
1. Verify `GCP_SA_KEY` secret contains valid JSON
2. Ensure no extra spaces or characters were added
3. Recreate the service account key if needed

### Issue: "Docker push failed"

**Solution**:

```bash
# Verify Container Registry is enabled
gcloud services list --enabled | grep containerregistry

# Check storage bucket exists
gsutil ls gs://artifacts.${PROJECT_ID}.appspot.com/
```

### Issue: Environment variables not set

**Solution**: Verify these secrets exist in GitHub:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## 🎯 Workflow Features

### Deploy Workflow (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**Steps:**
1. ✅ Checkout code
2. ✅ Setup Google Cloud SDK
3. ✅ Build Docker image
4. ✅ Push to Google Container Registry
5. ✅ Deploy to Cloud Run
6. ✅ Create deployment summary

### PR Validation Workflow (`pr-validation.yml`)

**Triggers:**
- Pull request to `main` branch
- Manual trigger via GitHub UI

**Steps:**
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ TypeScript type check
4. ✅ Build Docker image
5. ✅ Test container health
6. ✅ Check image size

---

## 📈 Best Practices

### 1. Use Branch Protection

**Settings → Branches → Add rule**

- ✅ Require pull request before merging
- ✅ Require status checks to pass (select PR Validation)
- ✅ Require branches to be up to date

### 2. Monitor Costs

Set up budget alerts in GCP:

```bash
# Create budget alert (example for $10/month)
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Cloud Run Budget" \
  --budget-amount=10 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### 3. Use Environment-Specific Configs

For staging/production environments:

1. Create separate GCP projects
2. Add environment-specific secrets (e.g., `PROD_SUPABASE_URL`)
3. Create separate workflows or use workflow inputs

### 4. Tag Releases

```bash
# Create a release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Consider modifying deploy workflow to trigger on tags:

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

---

## 🔗 Useful Commands

### View Workflow Logs Locally

```bash
# Install GitHub CLI
gh auth login

# View workflow runs
gh run list

# View specific run logs
gh run view [RUN_ID] --log
```

### Manually Deploy from Local

```bash
# Build
docker build -t gcr.io/$PROJECT_ID/meetjoshi-portfolio:manual .

# Push
docker push gcr.io/$PROJECT_ID/meetjoshi-portfolio:manual

# Deploy
gcloud run deploy meetjoshi-portfolio \
  --image gcr.io/$PROJECT_ID/meetjoshi-portfolio:manual \
  --region us-central1
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCP Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Container Registry](https://cloud.google.com/container-registry/docs)

---

## ✅ Setup Checklist

- [ ] GCP project created
- [ ] Service account created with required roles
- [ ] Service account JSON key generated
- [ ] All 4 GitHub secrets added
- [ ] Required GCP APIs enabled
- [ ] Test deployment ran successfully
- [ ] Service URL is accessible
- [ ] Environment variables working (check Supabase connection)
- [ ] Branch protection rules configured (optional)
- [ ] Budget alerts set up (optional)

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0
