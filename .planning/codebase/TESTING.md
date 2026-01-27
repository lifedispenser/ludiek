# Testing Patterns

**Analysis Date:** 2026-01-27

## Test Framework

**Runner:**

- Vitest `^4.0.6`
- Config: `vite.config.ts`
- Environment: `jsdom`

**Assertion Library:**

- Vitest built-in `expect()`

**Run Commands:**

```bash
npm test              # Run all tests
npm run coverage      # Run with coverage
vitest                # Watch mode
```

**Coverage:**

- Provider: `v8` via `@vitest/coverage-v8`
- Includes: `./src/**/*.ts`
- Excludes: tests from coverage

## Test File Organization

**Location:**

- Co-located in `tests/` directory at package root
- Mirrors src structure: `tests/engine/condition/` mirrors `src/engine/condition/`
- Shared fixtures: `tests/shared/`

**Naming:**

- `*.spec.ts` pattern for unit tests
- `*-bad-weather.spec.ts` for error case tests

**Structure:**

```
packages/ludiek/
├── src/
│   ├── engine/
│   │   ├── condition/
│   │   └── input/
│   └── plugins/
│       └── currency/
└── tests/
    ├── engine/
    │   ├── condition/
    │   │   └── conditions.spec.ts
    │   └── input/
    ├── plugins/
    │   └── currency/
    │       ├── currency-plugin.spec.ts
    │       └── currency-plugin-bad-weather.spec.ts
    └── shared/
        ├── EmptyOutput.ts
        ├── AlwaysProducer.ts
        └── NeverProducer.ts
```

## Test Structure

**Suite Organization:**

```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { CurrencyPlugin } from '@ludiek/plugins/currency/CurrencyPlugin';

const currency = new CurrencyPlugin();
beforeEach(() => {
  currency.loadContent([{ id: '/currency/money' }]);
});

describe('Happy flow', () => {
  it('does something positive', () => {
    // Arrange
    currency.gainCurrency({ id: '/currency/money', amount: 10 });

    // Act
    const balance = currency.getBalance('/currency/money');

    // Assert
    expect(balance).toBe(10);
  });
});
```

**Patterns:**

- `beforeEach()` for test setup
- `describe()` blocks for grouping (e.g., "Happy flow", "Bad flow")
- `it()` for individual tests
- Arrange-Act-Assert comments marking sections
- Module-level constants for test data

## Mocking

**Framework:** Vitest `vi`

**Patterns:**

```typescript
// Spy on methods
import { vi } from 'vitest';

const canProduceSpy = vi.spyOn(producer, 'canProduce');
const produceSpy = vi.spyOn(producer, 'produce');

// Mock return values
vi.spyOn(engine, 'canConsume').mockReturnValue(true);
vi.spyOn(engine, 'consume').mockReturnValue();

// Verify calls
expect(canProduceSpy).toBeCalledWith(output);
expect(produceSpy).toBeCalledWith(output, undefined);
```

**What to Mock:**

- Engine methods in plugin tests: `canConsume()`, `consume()`
- Method calls when verifying behavior
- Return values for complex dependencies

**What NOT to Mock:**

- Simple value objects
- Test fixtures (create instances instead)

## Fixtures and Factories

**Test Data:**

```typescript
// Module-level constants
const currencyContent = [{ id: '/currency/money' }, { id: '/currency/gems' }];

// Helper functions
const createGame = () => {
  const currency = new CurrencyPlugin();
  const engine = new LudiekEngine({ plugins: [currency] });
  return new LudiekGame(engine, { ... });
};

let game = createGame();
beforeEach(() => {
  game = createGame();
});
```

**Location:**

- `tests/shared/` for reusable test doubles
- Empty/Always/Never patterns for common scenarios

**Shared Fixture Pattern:**

```typescript
export interface EmptyOutput extends BaseOutput {
  type: '/output/empty';
}

export class EmptyProducer extends LudiekProducer<EmptyOutput> {
  readonly type = '/output/empty';

  canProduce(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  produce(output: EmptyOutput, fractional?: boolean): void {
    return;
  }
}
```

## Coverage

**Requirements:** No enforced target

**View Coverage:**

```bash
npm run coverage    # Generates coverage report
```

## Test Types

**Unit Tests:**

- Test single classes/functions in isolation
- Use fixtures and mocks for dependencies
- Focus on happy and sad paths
- Location: `tests/engine/`, `tests/plugins/`, `tests/stdlib/`

**Integration Tests:**

- Test multiple components working together
- Real instances, minimal mocking
- Example: `tests/consumer/smoke.spec.ts` tests full game loop

**E2E Tests:**

- Not detected

## Common Patterns

**Async Testing:**

```typescript
it('emits an event on tick', async () => {
  // Arrange
  expect.assertions(2);

  game.onTick.sub(() => {
    expect(true).toBeTruthy();
  });

  // Act
  game.start();
  await new Promise((resolve) => setTimeout(resolve, 2100));
});
```

**Error Testing:**

```typescript
// Separate "Bad flow" describe block
describe('Bad flow', () => {
  it('throws an error when accessing an invalid currency', () => {
    expect(() => currency.getBalance('unknown')).toThrow(InvalidCurrencyError);
  });
});
```

**Event Testing:**

```typescript
it('sends events on currency gain', () => {
  // Arrange
  expect.assertions(2);

  const unsub = currency.onCurrencyGain.subscribe((c) => {
    expect(c.amount).toBe(10);
    expect(c.id).toBe('/currency/money');
  });

  // Act
  currency.gainCurrency({ id: '/currency/money', amount: 10 });

  // After
  unsub();
});
```

**Parameterized Tests:**

```typescript
it.each([
  ['/condition/false', '/condition/false', false],
  ['/condition/false', '/condition/true', false],
  ['/condition/true', '/condition/false', false],
  ['/condition/true', '/condition/true', true],
])('Evaluates %s AND %s = $expected', (first: string, second: string, expected: boolean) => {
  const result = engine.evaluate({
    type: '/condition/and',
    first: { type: first },
    second: { type: second },
  });
  expect(result).toBe(expected);
});
```

**Type Testing:**

```typescript
it("throws an error when output doesn't exist on canProduce", () => {
  const engine = new LudiekEngine({});

  expect(() => {
    // @ts-expect-error unknown type
    engine.canProduce({ type: 'wrong', amount: 1 });
  }).toThrow(OutputNotFoundError);
});
```

**Deep Equality:**

```typescript
expect(save).toStrictEqual({
  engine: { currency: { balances: { '/currency/money': 1000 } } },
  features: { dummy: { xp: 1000 } },
});
```

---

_Testing analysis: 2026-01-27_
