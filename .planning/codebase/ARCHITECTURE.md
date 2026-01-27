# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Plugin-based game engine with dependency injection and contribution-based architecture

**Key Characteristics:**

- Modular plugin system where plugins extend engine capabilities
- Contribution pattern: plugins register evaluators, consumers, producers, controllers, and modifiers
- Strongly typed with TypeScript generics for compile-time safety
- Event-driven with strongly-typed events from `strongly-typed-events`
- Reactive state management compatible with Svelte's `$state` runes

## Layers

**Engine Layer:**

- Purpose: Core orchestrator that manages all plugins, evaluators, consumers, producers, controllers, and modifiers
- Location: `packages/ludiek/src/engine/`
- Contains: `LudiekEngine`, `LudiekEngineConcept`, registration logic, transaction handling
- Depends on: Plugin definitions, contribution implementations
- Used by: `LudiekGame`, application code

**Plugin Layer:**

- Purpose: Domain-specific game systems (currency, achievements, upgrades, etc.)
- Location: `packages/ludiek/src/plugins/`
- Contains: `CurrencyPlugin`, `UpgradePlugin`, `AchievementPlugin`, etc.
- Depends on: `LudiekPlugin` base, engine layer
- Used by: Engine registration, features, application code

**Contribution Layer:**

- Purpose: Plugin contributions that extend engine capabilities
- Location: `packages/ludiek/src/plugins/{plugin}/contributions/`
- Contains: Conditions (evaluators), Inputs (consumers), Outputs (producers), Requests (controllers), Bonuses (modifiers)
- Depends on: Plugin implementations, engine base classes
- Used by: Engine registration during initialization

**Stdlib Layer:**

- Purpose: Standard condition evaluators for common logic operations
- Location: `packages/ludiek/src/stdlib/`
- Contains: `AllCondition`, `AndCondition`, `OrCondition`, `NotCondition`, `AnyCondition`, etc.
- Depends on: `LudiekEvaluator` base class
- Used by: Plugins and application code for condition evaluation

**Feature Layer:**

- Purpose: High-level game mechanics that coordinate multiple plugins
- Location: `packages/ludiek/src/engine/LudiekFeature.ts`, application feature directories
- Contains: `LudiekFeature` base class, game-specific features
- Depends on: Plugins, engine
- Used by: `LudiekGame`, game logic

**Game Layer:**

- Purpose: Game loop orchestration and persistence management
- Location: `packages/ludiek/src/engine/LudiekGame.ts`
- Contains: `LudiekGame` class with tick loop, save/load
- Depends on: `LudiekEngine`, features
- Used by: Application code

**Persistence Layer:**

- Purpose: Save/load game state to localStorage
- Location: `packages/ludiek/src/engine/peristence/`
- Contains: `LudiekLocalStorage`, `LudiekSaveEncoder`, `LudiekJsonSaveEncoder`
- Depends on: Plugin save/load methods, engine state
- Used by: `LudiekGame`

## Data Flow

**Initialization Flow:**

1. Create plugin instances (with optional initial state)
2. Create contribution instances (evaluators, consumers, producers, controllers, modifiers)
3. Create `LudiekEngine` with plugins and contributions
4. Engine injects itself into all components via `inject()` method
5. Plugins load content definitions (currencies, upgrades, etc.) via `loadContent()`
6. Create `LudiekGame` with engine, features, and configuration
7. Features initialize with access to plugins

**Tick Flow:**

1. Game calls `tick(delta)` at fixed interval
2. Engine calls `preTick()` which collects active bonuses from all plugins
3. Game calls `update(delta)` on all features
4. If save interval elapsed, game calls `save()` and persists to localStorage

**Transaction Flow:**

1. Application creates transaction with input, output, and requirement
2. Engine evaluates requirement condition(s) via `evaluate()`
3. Engine checks if input can be consumed via `canConsume()`
4. Engine checks if output can be produced via `canProduce()`
5. Engine consumes input via `consume()`
6. Engine produces output via `produce()`
7. Bonuses are applied via modifier system during produce/consume operations

**Request Flow:**

1. Application creates request object
2. Engine calls `request()` which routes to controller
3. Controller resolves request by calling plugin/feature methods
4. Controller may trigger transactions or state changes

**State Management:**

- Plugins maintain their own state in `_state` property
- State is reactive when using Svelte's `$state()` runes
- Bonuses are collected at start of each tick from all plugins
- State persists via `save()`/`load()` methods on each plugin

## Key Abstractions

**LudiekEngineConcept:**

- Purpose: Base class for all engine components (evaluators, consumers, producers, controllers, modifiers)
- Examples: `packages/ludiek/src/engine/LudiekEngineConcept.ts`
- Pattern: Abstract class with `type` property and `inject()` method for dependency injection

**LudiekElement:**

- Purpose: Base class for plugins and features with state management and save/load
- Examples: `LudiekPlugin`, `LudiekFeature`
- Pattern: Provides protected methods to delegate to engine operations (`evaluate()`, `consume()`, `produce()`, etc.)

**LudiekPlugin:**

- Purpose: Base class for domain-specific plugins
- Examples: `CurrencyPlugin`, `UpgradePlugin`, `AchievementPlugin`
- Pattern: Extends `LudiekElement`, implements `loadContent()` to register content definitions, may provide `getBonuses()` for bonus contributions

**LudiekEvaluator:**

- Purpose: Evaluates whether conditions are true
- Examples: `HasCurrencyEvaluator`, `AllEvaluator`, `AndEvaluator`
- Pattern: Abstract class with `evaluate(condition)` method and optional `modify()` for bonus application

**LudiekConsumer:**

- Purpose: Handles input consumption (costs, requirements)
- Examples: `LoseCurrencyConsumer`
- Pattern: Abstract class with `canConsume(input)` and `consume(input)` methods

**LudiekProducer:**

- Purpose: Handles output production (rewards, results)
- Examples: `GainCurrencyProducer`, `SeedProducer`
- Pattern: Abstract class with `canProduce(output)` and `produce(output, fractional?)` methods

**LudiekController:**

- Purpose: Handles user actions/requests
- Examples: `EnterCouponController`, `SowSeedController`
- Pattern: Abstract class with `resolve(request)` method

**LudiekModifier:**

- Purpose: Applies bonuses to conditions, inputs, and outputs
- Examples: `GlobalSeedModifier`, `SeedModifier`
- Pattern: Abstract class with `stringify(bonus)` for bonus identification, supports 'additive' or 'multiplicative' variants

## Entry Points

**Library Entry Point:**

- Location: `packages/ludiek/src/index.ts`
- Triggers: Imported by applications
- Responsibilities: Re-exports all public API (engine, plugins, stdlib, utilities)

**Demo Application Entry Point:**

- Location: `apps/website/src/lib/demo/demo.svelte.ts`
- Triggers: Loaded by demo pages
- Responsibilities: Initializes engine, plugins, features, and game instance

**Website Entry Point:**

- Location: `apps/website/src/routes/+layout.ts`
- Triggers: Page load
- Responsibilities: SvelteKit configuration (SSR, prerender settings)

**Build Entry Points:**

- Location: `packages/ludiek/src/index.ts` (library), `apps/website/src/app.html` (website)
- Triggers: Build process
- Responsibilities: Bundle outputs: `dist/index.cjs.js`, `dist/index.es.js` (library), `.svelte-kit/` (website)

## Error Handling

**Strategy:** Hierarchical error classes thrown by components when invalid operations occur

**Patterns:**

- `LudiekError`: Base error class
- `ConditionNotFoundError`: Thrown when evaluator not registered for condition type
- `InputNotFoundError`: Thrown when consumer not registered for input type
- `OutputNotFoundError`: Thrown when producer not registered for output type
- `ControllerNotFoundError`: Thrown when controller not registered for request type
- `ModifierNotFoundError`: Thrown when modifier not registered for bonus type
- Plugin-specific errors (e.g., `InvalidCurrencyError`, `NegativeAmountError`, `UnknownUpgradeError`)

## Cross-Cutting Concerns

**Logging:** None detected (engine errors thrown directly to caller)

**Validation:** Runtime validation in plugin methods (e.g., `CurrencyPlugin.validate()` checks currency exists and amount is positive)

**Authentication:** Not applicable (client-side game engine)

**Type Safety:** Heavy use of TypeScript generics to maintain type safety across engine, plugins, and contributions. Type unions generated from registered component tuples.

**Events:** Strongly-typed event dispatchers using `strongly-typed-events` library (e.g., `onCurrencyGain`, `onCurrencyChanged` in plugins)

**Modifiers:** Bonus system allows plugins to contribute modifiers that alter condition evaluation, input consumption, and output production. Bonuses are additive or multiplicative and collected each tick.

**Persistence:** Plugins implement `save()` and `load()` methods via `LudiekSavable` interface. Engine aggregates plugin states into single save object.

---

_Architecture analysis: 2026-01-27_
