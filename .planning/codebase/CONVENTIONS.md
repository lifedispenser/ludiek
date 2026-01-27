# Coding Conventions

**Analysis Date:** 2026-01-27

## Naming Patterns

**Files:**

- PascalCase for classes: `CurrencyPlugin.ts`, `LudiekEngine.ts`
- kebab-case for configuration: `vite.config.ts`, `tsconfig.json`
- `.spec.ts` suffix for test files: `currency-plugin.spec.ts`, `conditions.spec.ts`

**Functions:**

- camelCase for all functions and methods: `gainCurrency()`, `loadContent()`, `getBalance()`
- Private methods use underscore prefix: `_validate()`, `ensureEngine()`
- Boolean methods: `hasCurrency()`, `canConsume()`, `supportsCurrency()`

**Variables:**

- camelCase for all variables: `const currency`, `let game`
- Private properties use underscore prefix: `_state`, `_engine`, `_currencies`
- Definite assignment assertion: `_engine!: LudiekEngine`

**Types:**

- PascalCase for interfaces and types: `CurrencyPluginState`, `LudiekCondition`
- Generic type parameters: `<Plugins extends readonly LudiekPlugin[]>`
- Union types: `type LudiekCondition<Evaluators extends readonly LudiekEvaluator[]>`

## Code Style

**Formatting:**

- Prettier with 2 spaces indentation
- Single quotes for strings: `'currency'`
- Trailing commas: `"trailingComma": "all"`
- Print width: 120 characters
- Format with `npm run format` or `prettier --write .`

**Linting:**

- ESLint from `@123ishatest/ludiek-eslint-config`
- Config files: `eslint.config.js`
- Prevents imports from `@tests` or `tests/` in production code
- Run with `npm run lint` (includes both prettier and eslint)
- Common disables: `eslint-disable-next-line @typescript-eslint/no-unused-vars`

## Import Organization

**Order:**

1. Internal imports (from `@ludiek/*`)
2. External library imports
3. Relative imports (rare)

**Path Aliases:**

- `@ludiek/*` maps to `./src/*` (e.g., `@ludiek/engine/LudiekEngine`)
- `@tests/*` maps to `./tests/*` (test fixtures only)

**Example:**

```typescript
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { LudiekPlugin } from '@ludiek/engine/LudiekPlugin';
import { cloneDeep } from 'es-toolkit';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';
```

## Error Handling

**Patterns:**

- Custom error classes extend base errors: `PluginError extends LudiekError`
- Specific errors extend plugin errors: `InvalidCurrencyError extends CurrencyPluginError`
- Throw with descriptive messages: `throw new InvalidCurrencyError('Currency not found')`
- Use `console.error()` for unexpected states (line 219 in LudiekEngine.ts)

**Error Class Pattern:**

```typescript
export abstract class LudiekError extends Error {}
export abstract class PluginError extends LudiekError {}
export class InvalidCurrencyError extends PluginError {}
```

## Logging

**Framework:** `console.error` for errors, `console.log` not typically used

**Patterns:**

- Errors logged when reaching unexpected states
- Descriptive error messages in exceptions
- No structured logging framework detected

## Comments

**When to Comment:**

- Public methods: JSDoc descriptions
- Complex logic: inline comments
- Internal methods: `@internal` tag
- Cross-references: `@see` tag
- Future work: `TODO(@username): description`

**JSDoc/TSDoc:**

```typescript
/**
 * Gain the specified amount of currency
 */
public gainCurrency(currency: Currency): void {}

/**
 * @internal
 * @see LudiekEngine.evaluate
 */
protected evaluate(condition: BaseCondition): boolean {}

/**
 * @todo(#61) Each currency is checked individually
 */
public payCurrencies(currencies: Currency[]): boolean {}
```

**TODO Format:**

- `TODO(@Isha): Should this be cached between ticks too?`
- `@todo(#61)` with issue number where applicable

## Function Design

**Size:** No strict guidelines, most functions under 30 lines

**Parameters:**

- Object parameters for complex inputs: `currency: { id: string, amount: number }`
- Type inference preferred over explicit typing where clear
- Destructuring used in utility functions

**Return Values:**

- `void` for state-mutating methods
- Boolean for query methods: `hasCurrency()`, `canConsume()`
- Objects for complex returns: state objects

**Optional Methods:**

- Optional chaining for method calls: `feature.update?.(delta)`

## Module Design

**Exports:**

- Named exports for classes: `export class CurrencyPlugin`
- Type exports with `export type`: `export type { CurrencyPluginState }`
- Barrel files (index.ts) for re-exports

**Barrel Files:**

```typescript
// Section comments
// Plugin
export { CurrencyPlugin } from './CurrencyPlugin';
export type { CurrencyDefinition } from './CurrencyDefinition';

// Blank lines between sections
// Conditions
export { HasCurrencyEvaluator } from './contributions/HasCurrencyCondition';
```

**Factory Functions:**

- State initialization with factory functions: `createCurrencyState()`

```typescript
export const createCurrencyState = (): CurrencyPluginState => {
  return { balances: {} };
};
```

**State Pattern:**

- State interfaces: `CurrencyPluginState`
- Protected state: `protected abstract _state: object;`
- State getter: `public get state(): object`

---

_Convention analysis: 2026-01-27_
