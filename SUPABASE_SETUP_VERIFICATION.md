# Supabase Setup Verification

This document helps you verify that your Supabase credentials are correctly configured.

## Local Development Configuration

### Environment Files Updated

The following files have been updated with your Supabase credentials:

- ✅ `src/environments/environment.ts` (development)
- ✅ `src/environments/environment.prod.ts` (production)

**Supabase URL**: `https://xzsnhghlivkvwgowhmpf.supabase.co`

## GitHub Actions Secrets Configuration

For automatic deployment to work, you **MUST** configure these secrets in GitHub:

### Steps to Add/Verify Secrets:

1. Go to: https://github.com/meetjoshi101/meetjoshi.info-aistudio/settings/secrets/actions

2. Verify or add these 4 secrets:

| Secret Name | Value | Status |
|------------|-------|--------|
| `SUPABASE_URL` | `https://xzsnhghlivkvwgowhmpf.supabase.co` | ⚠️ **Required** |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ⚠️ **Required** |
| `GCP_PROJECT_ID` | Your GCP project ID | ⚠️ **Required** |
| `GCP_SA_KEY` | Your service account JSON key | ⚠️ **Required** |

### How to Add a Secret:

1. Click **"New repository secret"**
2. **Name**: Enter the secret name exactly as shown (e.g., `SUPABASE_URL`)
3. **Value**: Paste the corresponding value
4. Click **"Add secret"**

### Update Existing Secrets:

If a secret already exists but needs updating:
1. Click on the secret name
2. Click **"Update secret"**
3. Paste the new value
4. Click **"Update secret"**

## How the Deployment Works

### Development (Local)
When you run `npm start`, the app uses `src/environments/environment.ts` which now has the correct credentials.

### Production (Cloud Run)
When you push to `main` or trigger the GitHub Actions workflow:

1. **Docker Build Stage**: The workflow passes secrets as build arguments:
   ```bash
   docker build \
     --build-arg SUPABASE_URL=${{ secrets.SUPABASE_URL }} \
     --build-arg SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }} \
     ...
   ```

2. **Dockerfile Processing**: The Dockerfile replaces placeholders in `environment.prod.ts`:
   ```dockerfile
   RUN sed -i "s|YOUR_SUPABASE_URL|${SUPABASE_URL}|g" src/environments/environment.prod.ts && \
       sed -i "s|YOUR_SUPABASE_ANON_KEY|${SUPABASE_ANON_KEY}|g" src/environments/environment.prod.ts
   ```

3. **Angular Build**: The app is built with the actual credentials baked into the compiled JavaScript.

## Testing the Connection

### Test Locally (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open browser to http://localhost:4200

4. Open browser console (F12) and check for errors

5. Navigate to the Blog or Projects section to test Supabase queries

### Test Production Build

1. Build the production version:
   ```bash
   npm run build
   ```

2. Check the built files contain real credentials (not placeholders):
   ```bash
   grep -r "xzsnhghlivkvwgowhmpf" dist/
   ```
   You should see your Supabase URL in the output.

### Test Deployed Version

After GitHub Actions deploys to Cloud Run:

1. Visit your Cloud Run service URL

2. Open browser console (F12)

3. Look for any Supabase-related errors

4. Check Network tab for Supabase API calls to `https://xzsnhghlivkvwgowhmpf.supabase.co`

## Common Issues & Solutions

### Issue 1: "Invalid supabaseUrl" Error

**Cause**: Environment files still contain placeholder values OR GitHub secrets not set

**Solution**:
- ✅ Local files have been updated (already fixed)
- ⚠️ Verify GitHub secrets are configured (see above)
- 🔄 Trigger a new deployment after updating secrets

### Issue 2: Deployment Succeeds but App Shows Errors

**Cause**: GitHub secrets were not set before deployment

**Solution**:
1. Add/update the secrets in GitHub
2. Trigger a new deployment:
   - Go to: https://github.com/meetjoshi101/meetjoshi.info-aistudio/actions
   - Click "Deploy to Cloud Run"
   - Click "Run workflow"
   - Select `main` branch
   - Click "Run workflow"

### Issue 3: Local Development Works but Production Doesn't

**Cause**: GitHub secrets not matching local values

**Solution**:
Ensure GitHub secrets match:
- `SUPABASE_URL` = `https://xzsnhghlivkvwgowhmpf.supabase.co`
- `SUPABASE_ANON_KEY` = Your anon key (starts with `eyJhbGciOiJIUzI1NiIs...`)

## Verification Checklist

Use this checklist to ensure everything is configured:

- [ ] Local `environment.ts` has correct Supabase URL
- [ ] Local `environment.prod.ts` has correct Supabase URL
- [ ] GitHub secret `SUPABASE_URL` is set
- [ ] GitHub secret `SUPABASE_ANON_KEY` is set
- [ ] GitHub secret `GCP_PROJECT_ID` is set
- [ ] GitHub secret `GCP_SA_KEY` is set
- [ ] Local development server connects to Supabase successfully
- [ ] Production build contains actual credentials (not placeholders)
- [ ] New deployment triggered after updating secrets
- [ ] Deployed app connects to Supabase successfully

## Next Steps

1. **Verify GitHub Secrets**: Go to GitHub and ensure all 4 secrets are configured
2. **Trigger Deployment**: Push to `main` or manually trigger the workflow
3. **Monitor Deployment**: Check GitHub Actions for any errors
4. **Test Live Site**: Visit your Cloud Run URL and verify Supabase connection

## Support Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**Last Updated**: 2026-01-07
**Configuration Status**: ✅ Local files updated, ⚠️ GitHub secrets need verification
