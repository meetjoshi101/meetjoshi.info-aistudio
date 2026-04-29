# Codebase Task Proposals

## 1) Typo fix task
**Issue found:** A generated Playwright test-results path contains a mangled test title segment (`should-s-d5abc-ation-errors`) where `validation` is truncated/corrupted, which makes debugging artifacts harder to scan quickly.

**Proposed task:** Normalize test titles and/or artifact naming so human-readable words remain intact in generated folders (for example, shorten test names in specs and rely on clear assertion comments for detail).

**Primary evidence:** `test-results/admin-Admin-Panel-should-s-d5abc-ation-errors-for-empty-form-chromium/error-context.md`.

---

## 2) Bug fix task
**Issue found:** `DataService` still uses `.toPromise()` in multiple async CRUD methods. In RxJS 7+, `toPromise` is deprecated and can lead to subtle behavior issues (including ambiguous `undefined` resolution semantics).

**Proposed task:** Replace `.toPromise()` usages with `firstValueFrom`/`lastValueFrom`, and tighten return-path handling so failed requests are distinguished from empty payloads.

**Primary evidence:** `apps/frontend/src/services/data.service.ts` (create/update/delete methods for projects and blog posts).

---

## 3) Code comment / documentation discrepancy task
**Issue found:** Deployment docs reference environment files under `src/environments/...`, but this Nx monorepo stores them under `apps/frontend/src/environments/...`.

**Proposed task:** Update deployment documentation paths so setup steps match the current repository structure.

**Primary evidence:** `DEPLOYMENT.md` ("Edit `src/environments/environment.ts`" and prod equivalent) vs actual files in `apps/frontend/src/environments/`.

---

## 4) Test improvement task
**Issue found:** E2E admin tests rely on fixed sleeps (`waitForTimeout(2000)` / `waitForTimeout(3000)`), which are a common source of flaky and slower CI runs.

**Proposed task:** Replace fixed timeouts with deterministic waits (`expect(locator).toBeVisible()`, `waitForURL`, network-idle checks, or explicit response waits), and centralize common login-page readiness helpers.

**Primary evidence:** `e2e/admin.spec.ts`.
