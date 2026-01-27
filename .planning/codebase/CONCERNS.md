# Codebase Concerns

**Analysis Date:** 2026-01-27

## Tech Debt

**Configuration Validation:**

- Issue: `LudiekGameConfig` interface lacks runtime validation. TODO mentions using Zod but not implemented.
- Files: `packages/ludiek/src/engine/LudiekGameConfig.ts:5`
- Impact: Invalid configuration can cause runtime errors without helpful error messages
- Fix approach: Integrate Zod for schema validation with nice defaults as planned

**State Management Architecture:**

- Issue: State management needs improvement according to TODO. Current approach mixes concerns between Engine and Game classes.
- Files: `packages/ludiek/src/engine/LudiekGame.ts:64`
- Impact: Difficult to track state changes, potential for inconsistencies
- Fix approach: Implement centralized state management with immutable state patterns

**Game Loop Implementation:**

- Issue: Current game loop uses simple setInterval without requestAnimationFrame or delta time smoothing.
- Files: `packages/ludiek/src/engine/LudiekGame.ts:57`
- Impact: Inconsistent timing, potential for frame drops and gameplay issues
- Fix approach: Implement proper game loop with requestAnimationFrame and delta time normalization

**Enum Conversion:**

- Issue: Coupon redemption returns boolean instead of proper enum responses (success, invalid-code, already-redeemed, etc.)
- Files: `packages/ludiek/src/plugins/coupon/CouponPlugin.ts:35`
- Impact: Limited error reporting, difficult to provide user feedback
- Fix approach: Convert to enum-based response system as planned

**Experience Caps:**

- Issue: No experience cap mechanism, though mentioned as TODO. Skills can gain unlimited experience.
- Files: `packages/ludiek/src/plugins/skill/contributions/GainSkillExperienceOutput.ts:19`
- Impact: Potential for unbounded growth, balance issues in games
- Fix approach: Add maxExperience property to SkillDefinition and enforce caps

**Loot Table Restrictions:**

- Issue: RollLootTableOutput.canProduce always returns true. No validation of table restrictions or prerequisites.
- Files: `packages/ludiek/src/plugins/lootTable/contributions/RollLootTableOutput.ts:17`
- Impact: Loot tables can be rolled without proper conditions checked
- Fix approach: Implement proper validation based on table configuration

**Features Architecture:**

- Issue: Features are stored but their purpose and handling is unclear. TODO asks "What to do with features?"
- Files: `packages/ludiek/src/engine/LudiekGame.ts:45`
- Impact: Ambiguous feature system, unclear separation from plugins
- Fix approach: Clarify feature system architecture and purpose

**Response Object Pattern:**

- Issue: Controllers return void instead of response objects. TODO mentions creating LudiekResponse.
- Files: `packages/ludiek/src/engine/request/LudiekRequest.ts:14`
- Impact: Controllers cannot provide feedback or return values
- Fix approach: Implement LudiekResponse pattern for controller results

**Performance Optimization Needed:**

- Issue: Skill level calculation uses findIndex on experience array - O(n) operation called frequently.
- Files: `packages/ludiek/src/plugins/skill/SkillPlugin.ts:66`
- Impact: Performance degradation with many experience levels
- Fix approach: Cache level calculations or use binary search for sorted arrays

**Bonus Caching:**

- Issue: Bonuses are recalculated every tick despite TODO suggesting caching.
- Files: `packages/ludiek/src/engine/LudiekEngine.ts:205`
- Impact: Unnecessary CPU usage during ticks
- Fix approach: Implement bonus caching with invalidation on state changes

**Feature Bonus Collection:**

- Issue: collectBonuses only checks plugins, not features. TODO mentions checking all features too.
- Files: `packages/ludiek/src/engine/LudiekEngine.ts:229`
- Impact: Feature-based bonuses not collected
- Fix approach: Implement feature bonus collection system

**PreTick Architecture:**

- Issue: preTick called by Game class, but TODO suggests moving Features to engine and changing this.
- Files: `packages/ludiek/src/engine/LudiekEngine.ts:379`
- Impact: Tightly coupled architecture, unclear responsibility boundaries
- Fix approach: Refactor tick architecture with clear separation of concerns

## Known Bugs

**Currency Duplicate ID Handling:**

- Symptoms: `payCurrencies` and `hasCurrencies` don't aggregate duplicate currency IDs properly
- Files: `packages/ludiek/src/plugins/currency/CurrencyPlugin.ts:101, 122`
- Trigger: Passing currency array with duplicate IDs
- Workaround: Ensure no duplicate IDs in currency arrays
- Impact: Can lead to negative balances or incorrect validation

**Empty Returns Without Context:**

- Symptoms: Several methods return empty arrays without error messages or logging
- Files:
  - `packages/ludiek/src/plugins/upgrade/UpgradePlugin.ts:129`
  - `packages/ludiek/src/plugins/lootTable/LootTablePlugin.ts:55, 63, 72`
  - `packages/ludiek/src/engine/LudiekElement.ts:47`
- Impact: Silent failures, difficult to debug
- Fix approach: Add logging or throw errors for unexpected empty states

## Security Considerations

**Local Storage Validation:**

- Risk: `localStorage.setItem` used without sanitization or size limit checks
- Files: `packages/ludiek/src/engine/peristence/LudiekLocalStorage.ts:10`
- Current mitigation: None
- Recommendations: Add size checks, implement compression, validate data before storage

**JSON Parse Without Validation:**

- Risk: `JSON.parse` called without error handling or schema validation on save data
- Files: `packages/ludiek/src/engine/peristence/LudiekJsonSaveEncoder.ts:13`
- Current mitigation: None - malformed JSON will crash
- Recommendations: Add try-catch with validation, migrate to Zod-validated parsing

**Coupon Hash Vulnerability:**

- Risk: Simple hash-based coupon system could be vulnerable to brute force attacks
- Files: `packages/ludiek/src/plugins/coupon/CouponPlugin.ts:29`
- Current mitigation: Hash comparison only
- Recommendations: Use stronger cryptographic hashing, add rate limiting, implement server-side validation

**Configuration Injection:**

- Risk: No validation of plugin or engine configuration at runtime
- Files: `packages/ludiek/src/engine/LudiekEngineConfig.ts`, `packages/ludiek/src/engine/LudiekGameConfig.ts`
- Current mitigation: TypeScript type safety only
- Recommendations: Add runtime validation with Zod schemas

## Performance Bottlenecks

**Deep Cloning on Every Operation:**

- Problem: `cloneDeep` called 9+ times in engine for every evaluate, consume, produce operation
- Files: `packages/ludiek/src/engine/LudiekEngine.ts:104, 150, 166, 182, 199, 251, 256, 261`
- Cause: Immutable data pattern implementation with full deep copies
- Improvement path: Implement structural sharing, use immutability libraries, or document mutability constraints

**Skill Level Calculation:**

- Problem: O(n) findIndex on experiencePerLevel array for every level check
- Files: `packages/ludiek/src/plugins/skill/SkillPlugin.ts:67`
- Cause: Linear search through experience thresholds
- Improvement path: Cache level mapping, implement binary search, or pre-compute level lookups

**Bonus Recalculation:**

- Problem: All bonuses recalculated every tick even when unchanged
- Files: `packages/ludiek/src/engine/LudiekEngine.ts:228-247`
- Cause: No caching or invalidation mechanism
- Improvement path: Implement bonus caching with dirty flag pattern

## Fragile Areas

**Engine Monolith:**

- Files: `packages/ludiek/src/engine/LudiekEngine.ts` (382 lines)
- Why fragile: Multiple responsibilities (registration, evaluation, transaction, modifiers, persistence)
- Safe modification: Add new methods at end, avoid touching private methods, test extensively
- Test coverage: Moderate - exists but may not cover all edge cases

**Plugin Injection Order:**

- Files: `packages/ludiek/src/engine/LudiekPlugin.ts`, `packages/ludiek/src/engine/LudiekEngine.ts:37-38`
- Why fragile: Plugins must be injected in correct order, inject() called before plugin methods used
- Safe modification: Document injection requirements, add validation in inject()
- Test coverage: Limited - injection errors may not be caught

**State Synchronization:**

- Files: Multiple plugin state files and engine save/load methods
- Why fragile: State managed across multiple locations, manual sync required
- Safe modification: Implement comprehensive save/load tests, use versioned save data
- Test coverage: Gaps - edge cases in state restoration not fully tested

**Event System Dependencies:**

- Files: All plugins using `SimpleEventDispatcher` from `strongly-typed-events`
- Why fragile: Event listeners not tracked, memory leaks possible, unsubscribe not enforced
- Safe modification: Add event listener tracking, implement automatic cleanup, document event lifecycle
- Test coverage: Poor - event cleanup and memory leaks not tested

## Scaling Limits

**Local Storage Capacity:**

- Current capacity: ~5-10MB (browser dependent)
- Limit: Game state exceeding storage quota will fail silently
- Scaling path: Implement data compression, migrate to IndexedDB, add storage monitoring

**Skill Experience Array Size:**

- Current capacity: Linear search in experiencePerLevel array
- Limit: Performance degradation with 100+ levels
- Scaling path: Implement caching, use lookup tables, redesign experience curve system

**Plugin Registration:**

- Current capacity: No limit, but all plugins loaded at once
- Limit: Memory usage with many plugins
- Scaling path: Implement lazy loading, plugin sandboxing, resource budgets

**Tick Rate:**

- Current capacity: setInterval-based, CPU dependent
- Limit: May degrade with many active generators/modifiers
- Scaling path: Implement delta time scaling, async tick processing, performance profiling

## Dependencies at Risk

**strongly-typed-events (v3.0.11):**

- Risk: External dependency with potential for abandonment or breaking changes
- Impact: Event system replacement would require significant refactoring of all plugins
- Migration plan: Consider implementing custom event system using standard EventTarget or RxJS

**es-toolkit (v1.39.10):**

- Risk: Relatively new utility library, API stability uncertain
- Impact: cloneDeep and utility functions used throughout engine
- Migration plan: Evaluate lodash replacement, consider inlining critical utilities

**vitest (v4.0.6):**

- Risk: Major version with potential breaking changes
- Impact: Test configuration and mocking may need updates
- Migration plan: Pin to stable minor version, monitor release notes

## Missing Critical Features

**Save Data Validation:**

- Problem: No validation when loading save data from localStorage
- Blocks: Reloading corrupted saves could crash game
- Files: `packages/ludiek/src/engine/peristence/LudiekLocalStorage.ts`, `packages/ludiek/src/engine/peristence/LudiekJsonSaveEncoder.ts`

**Error Recovery:**

- Problem: No graceful error handling for plugin failures
- Blocks: Single plugin error can crash entire game
- Files: All plugin implementations lack error boundaries

**Plugin Lifecycle Hooks:**

- Problem: No beforeSave/afterSave or beforeLoad/afterLoad hooks
- Blocks: Cannot implement save data migrations or version compatibility
- Files: `packages/ludiek/src/engine/LudiekPlugin.ts`

**State Rollback:**

- Problem: No transaction support or undo capability
- Blocks: Cannot implement "try before buy" or transactional operations
- Files: `packages/ludiek/src/engine/transaction/LudiekTransaction.ts`

**Performance Monitoring:**

- Problem: No metrics or profiling built into engine
- Blocks: Difficult to identify performance bottlenecks in production
- Files: Core engine classes lack instrumentation

## Test Coverage Gaps

**Plugin State Management:**

- What's not tested: Edge cases in save/load for all plugins
- Files: All plugin state files
- Risk: Corrupted saves not detected until production
- Priority: High

**Error Handling:**

- What's not tested: Invalid configuration handling, malformed save data recovery
- Files: Engine config and persistence layer
- Risk: Unhandled exceptions crash games
- Priority: High

**Event Cleanup:**

- What's not tested: Event listener memory leaks, unsubscribe behavior
- Files: All plugin event dispatchers
- Risk: Memory leaks in long-running games
- Priority: Medium

**Modifier System:**

- What's not tested: Complex modifier interactions, bonus aggregation edge cases
- Files: `packages/ludiek/src/engine/modifier/`
- Risk: Incorrect calculations with multiple modifiers
- Priority: Medium

**Concurrent Operations:**

- What's not tested: Race conditions in async operations (if any introduced)
- Files: Engine and all plugins
- Risk: State corruption with concurrent access
- Priority: Low (current sync architecture)

**Localization/i18n:**

- What's not tested: String output formatting, locale-specific behavior
- Files: Error messages, user-facing strings
- Risk: Poor internationalization support
- Priority: Low

---

_Concerns audit: 2026-01-27_
