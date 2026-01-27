# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
[project-root]/
├── apps/                  # Application packages
│   └── website/          # SvelteKit documentation and demo website
│       ├── src/           # Website source code
│       │   ├── routes/    # SvelteKit pages and layouts
│       │   └── lib/       # Website libraries (demo, docs, components)
│       ├── static/        # Static assets (icons, themes)
│       └── package.json   # Website dependencies
├── packages/              # Library packages
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── ludiek/            # Main game engine library
│   │   ├── src/           # Library source code
│   │   │   ├── engine/    # Core engine implementation
│   │   │   ├── plugins/   # Plugin implementations
│   │   │   ├── stdlib/    # Standard library (condition evaluators)
│   │   │   └── util/      # Utility functions
│   │   ├── tests/         # Test suite
│   │   └── dist/          # Build output (generated)
│   └── typescript-config/ # Shared TypeScript configuration
├── .changeset/            # Changeset configuration for versioning
├── .github/               # GitHub workflows
├── .planning/             # Planning and analysis documents
├── turbo.json             # Turborepo configuration
└── package.json           # Root monorepo configuration
```

## Directory Purposes

**apps/website:**

- Purpose: SvelteKit application for documentation and interactive demo
- Contains: Pages, demo game implementation, documentation content
- Key files: `src/lib/demo/demo.svelte.ts`, `src/routes/+layout.ts`

**packages/eslint-config:**

- Purpose: Shared ESLint configuration for all packages
- Contains: Flat config with TypeScript and Svelte rules
- Key files: `index.js`

**packages/ludiek:**

- Purpose: Core game engine library
- Contains: Engine, plugins, standard library, utilities
- Key files: `src/index.ts` (main export), `src/engine/LudiekEngine.ts`

**packages/typescript-config:**

- Purpose: Shared TypeScript configuration for all packages
- Contains: Base and Svelte-specific TypeScript configs
- Key files: `tsconfig.json`, `svelte.json`

**.github/workflows:**

- Purpose: CI/CD pipeline configuration
- Contains: GitHub Actions workflow files

**.planning/codebase:**

- Purpose: Architecture and structure analysis documents
- Contains: Generated analysis for GSD planning

## Key File Locations

**Entry Points:**

- `packages/ludiek/src/index.ts`: Main library export (bundles to `dist/`)
- `apps/website/src/routes/+layout.ts`: SvelteKit app configuration
- `apps/website/src/lib/demo/demo.svelte.ts`: Demo game initialization

**Configuration:**

- `package.json`: Root monorepo package configuration
- `turbo.json`: Turborepo task pipeline configuration
- `packages/ludiek/package.json`: Library package configuration
- `apps/website/package.json`: Website application configuration
- `packages/ludiek/tsconfig.build.json`: Library TypeScript build configuration

**Core Logic:**

- `packages/ludiek/src/engine/`: Engine core implementation
  - `LudiekEngine.ts`: Main engine class
  - `LudiekPlugin.ts`: Plugin base class
  - `LudiekFeature.ts`: Feature base class
  - `LudiekGame.ts`: Game loop and persistence
  - `LudiekElement.ts`: Shared base for plugins/features
- `packages/ludiek/src/plugins/`: Plugin implementations
  - `currency/CurrencyPlugin.ts`: Currency management
  - `upgrade/UpgradePlugin.ts`: Upgrade system
  - `achievement/AchievementPlugin.ts`: Achievement tracking
  - `statistic/StatisticPlugin.ts`: Statistics system
  - `skill/SkillPlugin.ts`: Skill/experience system
  - `buff/BuffPlugin.ts`: Temporary effects
  - `coupon/CouponPlugin.ts`: Coupon redemption
  - `keyItem/KeyItemPlugin.ts`: Key items
  - `lootTable/LootTablePlugin.ts`: Loot generation
  - `generator/GeneratorPlugin.ts`: Resource generation

**Testing:**

- `packages/ludiek/tests/`: Test suite mirroring source structure
  - `tests/engine/`: Engine component tests
  - `tests/plugins/`: Plugin tests
  - `tests/stdlib/`: Standard library tests
  - `tests/util/`: Utility tests
- `vitest.config.ts` (in package root): Vitest configuration

## Naming Conventions

**Files:**

- PascalCase for TypeScript classes: `LudiekEngine.ts`, `CurrencyPlugin.ts`
- camelCase for utilities and helpers: `hash.ts`, `progress.ts`
- `{Name}.spec.ts` for test files: `autowiring.spec.ts`
- `{Name}.config.{ext}` for configuration: `eslint.config.js`

**Directories:**

- lowercase for directories: `engine/`, `plugins/`, `stdlib/`
- camelCase for subdirectories when grouping related functionality: `contributions/`, `peristence/` (note: typo in persistence)

**Plugins:**

- `{Name}Plugin.ts`: Main plugin class file
- `{Name}Definition.ts`: Content definition interface
- `{Name}PluginState.ts`: State interface and factory
- `{Name}Events.ts`: Event type definitions
- `{Name}Errors.ts`: Error class definitions
- `index.ts`: Public exports barrel file
- `contributions/`: Evaluators, consumers, producers contributed by plugin

**Type Names:**

- `Ludiek{Concept}`: Core engine abstractions (e.g., `LudiekEvaluator`, `LudiekConsumer`)
- `{Plugin}{Concept}`: Plugin-specific contributions (e.g., `HasCurrencyCondition`, `GainCurrencyOutput`)
- `{Plugin}{Type}`: Plugin-specific types (e.g., `Currency`, `UpgradeDefinition`)

## Where to Add New Code

**New Plugin:**

- Primary code: `packages/ludiek/src/plugins/{pluginname}/{PluginName}Plugin.ts`
- State: `packages/ludiek/src/plugins/{pluginname}/{PluginName}PluginState.ts`
- Definitions: `packages/ludiek/src/plugins/{pluginname}/{PluginName}Definition.ts`
- Events: `packages/ludiek/src/plugins/{pluginname}/{PluginName}Events.ts`
- Errors: `packages/ludiek/src/plugins/{pluginname}/{PluginName}Errors.ts`
- Exports: `packages/ludiek/src/plugins/{pluginname}/index.ts`
- Contributions: `packages/ludiek/src/plugins/{pluginname}/contributions/`
- Tests: `packages/ludiek/tests/plugins/{pluginname}/`

**New Plugin Contribution:**

- Implementation: `packages/ludiek/src/plugins/{pluginname}/contributions/{Name}{Type}.ts`
- Tests: `packages/ludiek/tests/plugins/{pluginname}/contributions/{name}-{type}.spec.ts`

**New Stdlib Evaluator:**

- Implementation: `packages/ludiek/src/stdlib/condition/{Name}Condition.ts`
- Export: Add to `packages/ludiek/src/stdlib/index.ts`
- Tests: `packages/ludiek/tests/stdlib/condition/{name}-condition.spec.ts`

**New Utility Function:**

- Implementation: `packages/ludiek/src/util/{name}.ts`
- Export: Add to library index if public API
- Tests: `packages/ludiek/tests/util/{name}.spec.ts`

**New Website Page:**

- Implementation: `apps/website/src/routes/{path}/+page.svelte`
- Data loading: `apps/website/src/routes/{path}/+page.server.ts` (if needed)

**New Demo Feature:**

- Implementation: `apps/website/src/lib/demo/features/{FeatureName}.ts`
- Controller: `apps/website/src/lib/demo/features/{FeatureName}Controller.ts` (if needed)
- Model types: `apps/website/src/lib/demo/model/{TypeName}Detail.ts`
- Content: Add to `apps/website/src/lib/demo/content.ts`

## Special Directories

**dist/:**

- Purpose: Build output from library compilation
- Generated: Yes
- Committed: No (in `.gitignore`)

**.turbo/:**

- Purpose: Turborepo cache and daemon data
- Generated: Yes
- Committed: No (in `.gitignore`)

**node_modules/:**

- Purpose: npm dependency installations
- Generated: Yes
- Committed: No (in `.gitignore`)

**.svelte-kit/:**

- Purpose: SvelteKit build and dev artifacts
- Generated: Yes
- Committed: No (in `.gitignore`)

**peristence/:**

- Purpose: Persistence layer for save/load functionality
- Generated: No
- Committed: Yes (note: contains typo "peristence" instead of "persistence")

**contributions/:**

- Purpose: Plugin contributions (evaluators, consumers, producers) that extend engine capabilities
- Generated: No
- Committed: Yes

---

_Structure analysis: 2026-01-27_
