# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**None Detected** - This is a standalone game engine library with no external API integrations.

**External Links (Documentation Only):**

- GitHub - `https://github.com/123ishaTest/ludiek` - Source code repository
- Discord - `https://discord.gg/GVGEAM5jbf` - Community chat (link in navbar)
- Patreon - `https://patreon.com/123IshaTest` - Funding support (link in navbar)

## Data Storage

**Databases:**

- None - Ludiek is a client-side game engine with no backend database requirements

**File Storage:**

- Local filesystem only - Static assets served from `apps/website/static/`
- No cloud storage integration (S3, Cloudflare R2, etc.)

**Caching:**

- None - No caching layer or service integration

## Authentication & Identity

**Auth Provider:**

- None - No authentication system required
- This is a library package, not an application with user accounts

## Monitoring & Observability

**Error Tracking:**

- None - No error tracking service (Sentry, Bugsnag, etc.)

**Logs:**

- Console logging only - No external logging service integration
- No log aggregation or monitoring

## CI/CD & Deployment

**Hosting:**

- GitHub Pages - Static site hosting for documentation/demo website
  - Deployment: `apps/website/build/` directory
  - Base path configurable via `BASE_PATH` environment variable

**CI Pipeline:**

- GitHub Actions - Continuous integration and deployment
  - `.github/workflows/ci.yml` - Pull request validation (lint, test, build)
  - `.github/workflows/deploy_website.yml` - Deploy website to GitHub Pages on main branch push
  - `.github/workflows/deploy_ludiek.yml` - Publish ludiek package to npm via Changesets

**Package Registry:**

- npm - Package publication for `@123ishatest/ludiek`
  - Uses `NPM_TOKEN` secret for authentication
  - Automated release via Changesets action

## Environment Configuration

**Required env vars:**

- `BASE_PATH` (optional) - Base path for GitHub Pages deployment, defaults to repo name
- `NPM_TOKEN` (GitHub secret only) - Authentication token for npm package publishing
- `GITHUB_TOKEN` (GitHub Actions provided) - GitHub API token for Changesets

**Secrets location:**

- GitHub repository secrets - For CI/CD operations only
- No application-level secrets required (client-side library)

## Webhooks & Callbacks

**Incoming:**

- None - No webhooks configured

**Outgoing:**

- None - No webhook integrations or external HTTP calls

## Third-Party Services

**Documentation:**

- GitHub Pages - Hosting for user documentation
- No documentation integration (Storybook, Docusaurus, etc.)

**Funding:**

- `.github/FUNDING.yml` - GitHub Sponsors and Patreon links
- No payment processing integration

## Development Tools

**Version Control:**

- GitHub - Source code hosting and issue tracking

**Package Management:**

- npm - Public registry for ludiek package
  - Package: `@123ishatest/ludiek`

---

_Integration audit: 2026-01-27_
