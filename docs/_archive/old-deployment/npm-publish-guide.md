# npm Publish Guide

This document records the working publish flow for `@ouraihub/ui-library` and its packages.

## Scope

Published packages:

- `@ouraihub/astro`
- `@ouraihub/core`
- `@ouraihub/hugo`
- `@ouraihub/preset-blog`
- `@ouraihub/preset-docs`
- `@ouraihub/tokens`

## Current publish model

The repository uses:

- `pnpm`
- `changesets`
- GitHub Actions

Two workflows are relevant:

- `.github/workflows/release.yml`
- `.github/workflows/publish.yml`

`release.yml` is the main workflow:

1. push to `master`
2. `changesets/action` creates or updates a release PR
3. merge the release PR
4. GitHub Actions publishes packages to npm automatically

`publish.yml` is a manual fallback workflow triggered by `workflow_dispatch`.

## Required npm token

The npm token must satisfy all of the following:

- created by the `solkiss` npm account
- has package publish permission for `@ouraihub`
- uses a granular access token or equivalent publish-capable token
- has `bypass 2FA` enabled

If `bypass 2FA` is missing, publish fails with:

```text
Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

## GitHub repository secret

Configure the token in the GitHub repository, not in the local project.

Path:

```text
Settings -> Secrets and variables -> Actions
```

Create or update this repository secret:

```text
Name: NPM_TOKEN
Value: <the verified npm token with bypass 2FA>
```

The workflows use:

- `secrets.NPM_TOKEN`
- `secrets.GITHUB_TOKEN`

## Local configuration

The repository root contains:

```text
.npmrc
```

Content:

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

This allows npm and pnpm to read the token from the environment.

## Local verification

Before publishing locally, verify the token first:

```powershell
$env:NPM_TOKEN='your-token'
$env:NODE_AUTH_TOKEN=$env:NPM_TOKEN
npm.cmd whoami
```

Expected output:

```text
solkiss
```

If this does not return `solkiss`, do not continue publishing.

## Local manual publish

If a local publish is needed:

```powershell
$env:NPM_TOKEN='your-token'
$env:NODE_AUTH_TOKEN=$env:NPM_TOKEN
pnpm release:publish
```

This runs:

1. `pnpm build`
2. `pnpm changeset publish`

## Automated GitHub publish flow

Recommended day-to-day flow:

1. create changesets for package changes
2. push to `master`
3. wait for `release.yml` to open or update the release PR
4. review and merge the release PR
5. let GitHub Actions publish to npm

## Known non-blocking logs

These logs looked noisy during successful publish and do not necessarily mean failure.

### 1. First publish 404s

Example:

```text
warn Received 404 for npm info "@ouraihub/core"
```

Meaning:

- normal for first publish
- package version does not exist on npm yet

### 2. Token check 403 before successful publish

Example:

```text
error while checking if token is required
npm error 403 Forbidden - GET https://registry.npmjs.org/-/npm/v1/user
```

Observed behavior:

- this appeared before publish
- packages were still published successfully afterward

Interpretation:

- treat it as npm or changesets compatibility noise unless the actual package publish fails

### 3. Unknown env config warnings

Example:

```text
npm warn Unknown env config "global-bin-dir"
```

Meaning:

- warning from npm about pnpm-related environment config
- not the root cause when package publish succeeds

### 4. `.npmrc` env replacement warning during build

Example:

```text
WARN Issue while reading ".npmrc". Failed to replace env in config: ${NPM_TOKEN}
```

Meaning:

- build subprocess read `.npmrc` before that environment variable was available in that context
- not a publish blocker if `npm.cmd whoami` works and publish succeeds

## Repository details that matter

- root package is private: `@ouraihub/ui-library`
- published packages live under `packages/*`
- `packages/preset-docs/package.json` must include:

```json
"publishConfig": {
  "access": "public"
}
```

## Failure checklist

If publish fails again, check in this order:

1. `npm.cmd whoami` returns `solkiss`
2. token has `bypass 2FA`
3. GitHub `NPM_TOKEN` secret is updated
4. package scope is still `@ouraihub`
5. package `publishConfig.access` is `public`

## Quick commands

Verify token:

```powershell
$env:NPM_TOKEN='your-token'
$env:NODE_AUTH_TOKEN=$env:NPM_TOKEN
npm.cmd whoami
```

Local publish:

```powershell
$env:NPM_TOKEN='your-token'
$env:NODE_AUTH_TOKEN=$env:NPM_TOKEN
pnpm release:publish
```
