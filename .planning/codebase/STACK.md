# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**

- TypeScript 5.x - Core language for ludiek package and website
- Svelte 5.x - UI component framework for website

**Secondary:**

- JavaScript (ESNext) - Support via TypeScript allowJs/checkJs
- Markdown (MDsveX) - Documentation content in website

## Runtime

**Environment:**

- Node.js >=18 - Minimum runtime requirement (Node 20 for CI, Node 22 for deployment)

**Package Manager:**

- npm 10.9.2 - Package management
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**

- SvelteKit 2.x - Full-stack web framework for documentation/demo site
  - Adapter: `@sveltejs/adapter-static` - Static site generation for GitHub Pages
- Ludiek 0.2.0 - Custom game engine library (intrinsic to project)

**Testing:**

- Vitest 4.0.6 - Unit and integration test runner
- @vitest/coverage-v8 4.0.6 - Code coverage using V8 engine
- jsdom 27.1.0 - DOM environment for tests

**Build/Dev:**

- Turborepo 2.5.5 - Monorepo build orchestration
- Vite 7.x - Build tool and dev server
- @changesets/cli 2.29.5 - Versioning and changelog management

## Key Dependencies

**Critical:**

- es-toolkit 1.39.10 - Utility functions for ludiek engine
- strongly-typed-events 3.0.11 - Event system for ludiek engine
- vite-plugin-dts 4.5.4 - TypeScript declaration generation
- vite-tsconfig-paths 5.1.4 - TypeScript path resolution in Vite
- mdsvex 0.12.3 - Markdown component transformer for SvelteKit

**Infrastructure:**

- @sveltejs/vite-plugin-svelte 6.0.0 - Svelte Vite integration
- @tailwindcss/vite 4.0.0 - Tailwind CSS Vite plugin
- vite-plugin-devtools-json 1.0.0 - Dev tools for debugging

**UI/Styling:**

- Tailwind CSS 4.0.0 - Utility-first CSS framework
- DaisyUI 5.0.46 - Component library built on Tailwind
- @tailwindcss/forms 0.5.9 - Form styling plugins
- @tailwindcss/typography 0.5.15 - Typography plugin

**Code Quality:**

- ESLint 9.x - Linting (flat config format)
- typescript-eslint 8.x - TypeScript-specific ESLint rules
- eslint-plugin-svelte 3.x - Svelte-specific linting
- eslint-config-prettier 10.x - Disables formatting rules
- Prettier 3.x - Code formatting
- prettier-plugin-svelte 3.x - Svelte formatting
- prettier-plugin-tailwindcss 0.7.1 - Tailwind class sorting

## Configuration

**Environment:**

- No .env files detected (environment variables minimal)
- Key configs required: BASE_PATH for production deployment (optional)

**Build:**

- vite.config.ts - Vite build configuration for both ludiek and website
- svelte.config.js - SvelteKit configuration with static adapter and MDsveX
- turbo.json - Monorepo task orchestration
- tsconfig.json (per package) - TypeScript compilation targets ESNext with NodeNext module resolution
- eslint.config.js (per package) - ESLint flat config with TypeScript and Svelte support

**Versioning:**

- .changeset/config.json - Changeset configuration for version management

## Platform Requirements

**Development:**

- Node.js 18+ (uses ES2022 features like top-level await)
- npm 10.9.2
- Git for version control

**Production:**

- Static site deployment (GitHub Pages)
- No server-side runtime required for ludiek library (client-side library)
- Website deployed as static assets to GitHub Pages

---

_Stack analysis: 2026-01-27_
