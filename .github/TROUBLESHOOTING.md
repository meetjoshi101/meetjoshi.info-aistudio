# GitHub Actions Setup - Troubleshooting Guide

## ❌ Error: "does not have permission to access projects instance [your-project-id]"

### Problem
You're getting permission errors when trying to create a service account.

### Solutions

---

## ✅ Solution 1: Find Your Real Project ID (Quick Fix)

You need to replace `"your-project-id"` with your actual GCP project ID.

### Step 1: Find Your Project ID

```bash
# List all your GCP projects
gcloud projects list

# This will show:
# PROJECT_ID              NAME                    PROJECT_NUMBER
# my-portfolio-12345      My Portfolio            123456789012
# another-project         Another Project         987654321098
```

**Look at the `PROJECT_ID` column** - that's what you need!

### Step 2: Use Your Real Project ID

Replace `your-project-id` with your actual project ID from above:

```bash
# Instead of this:
export PROJECT_ID="your-project-id"  # ❌ WRONG

# Use this (example):
export PROJECT_ID="my-portfolio-12345"  # ✅ CORRECT
```

Then run the commands again:

```bash
export PROJECT_ID="my-portfolio-12345"  # Use YOUR project ID here!

# Now create the service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer" \
    --project=$PROJECT_ID
```

---

## ✅ Solution 2: Check Your Permissions

### Check if you're the project owner:

```bash
# Check your current permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL@gmail.com"
```

**You need one of these roles:**
- `roles/owner` (best for personal projects)
- `roles/editor`
- `roles/iam.serviceAccountAdmin` + `roles/resourcemanager.projectIamAdmin`

### If you don't have permissions:

**Option A: Use a different project where you are the owner**

```bash
# Create a new project
gcloud projects create meetjoshi-portfolio-$(date +%s) \
  --name="Meet Joshi Portfolio"

# Use this new project
export PROJECT_ID="meetjoshi-portfolio-XXXXX"  # Use the ID from above
gcloud config set project $PROJECT_ID
```

**Option B: Ask the project owner to grant you permissions**

They need to run:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL@gmail.com" \
  --role="roles/owner"
```

---

## ✅ Solution 3: Use GCP Console UI (Easiest Method)

If command line is giving you trouble, use the web interface instead!

### Step 1: Go to Google Cloud Console

Open: https://console.cloud.google.com

### Step 2: Select Your Project

Click the project dropdown at the top → Select your project

### Step 3: Create Service Account via UI

1. **Navigate to IAM & Admin**:
   - Left menu → **IAM & Admin** → **Service Accounts**

2. **Create Service Account**:
   - Click **"+ CREATE SERVICE ACCOUNT"**
   - **Name**: `github-actions`
   - **Description**: `GitHub Actions Deployer`
   - Click **"CREATE AND CONTINUE"**

3. **Grant Roles** (Add 3 roles):
   - Click **"Select a role"**
   - Search and add: **Cloud Run Admin**
   - Click **"+ ADD ANOTHER ROLE"**
   - Search and add: **Service Account User**
   - Click **"+ ADD ANOTHER ROLE"**
   - Search and add: **Storage Admin**
   - Click **"CONTINUE"** → **"DONE"**

4. **Create JSON Key**:
   - Find your new `github-actions` service account in the list
   - Click the **⋮** (three dots) → **Manage keys**
   - Click **"ADD KEY"** → **"Create new key"**
   - Select **JSON**
   - Click **"CREATE"**
   - The JSON file downloads automatically! 📥

5. **Copy the JSON Key**:
   - Open the downloaded JSON file
   - Copy the entire contents
   - Save it for GitHub Secrets (next step)

### Step 4: Enable Required APIs via Console

1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable each:
   - **Cloud Run API**
   - **Container Registry API**
   - **Cloud Build API** (optional)

---

## ✅ Solution 4: Complete Setup Script (All-in-One)

Once you have your correct project ID, run this:

```bash
#!/bin/bash

# 1. Set your REAL project ID (find it with: gcloud projects list)
export PROJECT_ID="REPLACE_WITH_YOUR_PROJECT_ID"  # ⚠️ CHANGE THIS!

echo "Using project: $PROJECT_ID"

# 2. Set project as default
gcloud config set project $PROJECT_ID

# 3. Enable APIs
echo "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Create service account
echo "Creating service account..."
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer" \
    --project=$PROJECT_ID

# 5. Grant permissions
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# 6. Create JSON key
echo "Creating JSON key..."
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the contents of github-actions-key.json"
echo "2. Add to GitHub Secrets as GCP_SA_KEY"
echo ""
echo "Your project ID is: $PROJECT_ID"
echo "(Add this to GitHub Secrets as GCP_PROJECT_ID)"
echo ""

cat github-actions-key.json
```

Save this as `setup-gcp.sh` and run:

```bash
chmod +x setup-gcp.sh
./setup-gcp.sh
```

---

## 🔍 Verify Your Setup

After creating the service account, verify it exists:

```bash
# List service accounts
gcloud iam service-accounts list

# Should show:
# NAME                  EMAIL
# github-actions        github-actions@PROJECT_ID.iam.gserviceaccount.com

# Check permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@"
```

---

## 📋 Quick Checklist

- [ ] Found actual project ID (not "your-project-id")
- [ ] Verified you have Owner/Editor permissions
- [ ] Created service account (via CLI or Console)
- [ ] Granted 3 required roles (Cloud Run Admin, Service Account User, Storage Admin)
- [ ] Downloaded JSON key file
- [ ] Enabled required APIs (Cloud Run, Container Registry)
- [ ] Added 4 secrets to GitHub:
  - [ ] GCP_PROJECT_ID
  - [ ] GCP_SA_KEY (full JSON contents)
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY

---

## 💡 Common Mistakes

### ❌ Using literal "your-project-id"
```bash
export PROJECT_ID="your-project-id"  # Wrong!
```

### ✅ Using your actual project ID
```bash
export PROJECT_ID="meetjoshi-portfolio-123456"  # Correct!
```

### ❌ Copying JSON key with extra characters
Make sure to copy the entire JSON from `{` to `}` without any extra text.

### ✅ Valid JSON key format
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "abc123...",
  ...
}
```

---

## 🆘 Still Having Issues?

### Error: "NOT_FOUND: Unknown service account"

**Cause**: The service account wasn't created successfully.

**Solution**: Use the GCP Console UI method (Solution 3 above) instead.

### Error: "Permission denied"

**Cause**: You don't have sufficient permissions on the project.

**Solution**:
1. Create a new project where you'll be the owner
2. Or ask the project owner to grant you Owner role

### Error: "API not enabled"

**Solution**:
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## 📞 Need More Help?

- **GCP Console**: https://console.cloud.google.com
- **Service Accounts Guide**: https://cloud.google.com/iam/docs/service-accounts
- **IAM Roles**: https://cloud.google.com/iam/docs/understanding-roles
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Last Updated**: 2026-01-07
