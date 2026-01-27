# Benefits of Contribution Pattern for Generator Activation/Deactivation

This document demonstrates the key benefits of using the contribution pattern (`ActivateGeneratorProducer` and `DeactivateGeneratorProducer`) instead of direct plugin access.

---

## Benefit 1: Transaction-Based Activation with Conditions

### Without Contributions (Direct Plugin Access)

You need to manually check conditions before activating:

```typescript
// Old way: Direct plugin access
class GameFeature {
  constructor(private engine: LudiekEngine) {}

  activateGeneratorWithCondition(generatorId: string) {
    // Manual condition checking
    const hasEnoughGold = this.engine.plugins.currency.getAmount('gold') >= 100;
    const playerLevel = this.engine.plugins.statistic.getValue('level');
    const generatorUnlocked = this.engine.plugins.upgrade.isUnlocked('generator-unlock');

    // Manual validation
    if (!hasEnoughGold) {
      throw new Error('Not enough gold!');
    }
    if (playerLevel < 10) {
      throw new Error('Player level too low!');
    }
    if (!generatorUnlocked) {
      throw new Error('Generator not unlocked!');
    }

    // Manual activation
    this.engine.plugins.generator.activateGenerator(generatorId);
    this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });
  }
}
```

### With Contributions (Transaction-Based)

The engine handles all validation and execution atomically:

```typescript
// New way: Using transactions with contributions
class GameFeature {
  constructor(private engine: LudiekEngine) {}

  activateGeneratorWithCondition(generatorId: string) {
    const completed = this.engine.handleTransaction({
      // Check if player meets requirements
      requirement: {
        type: '/and',
        conditions: [
          { type: '/currency/has', id: 'gold', amount: 100 },
          { type: '/statistic/gte', id: 'level', value: 10 },
          { type: '/upgrade/is-unlocked', id: 'generator-unlock' }
        ]
      },
      // Pay the cost
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: 100
      },
      // Get the reward
      output: {
        type: '/generator/activate',
        id: generatorId
      }
    });

    if (!completed) {
      // Transaction failed - engine already validated everything
      // No partial state changes occurred
      console.log('Could not activate generator');
    }
  }
}
```

**Benefits:**
- ✅ Atomic operation (all-or-nothing)
- ✅ No partial state changes if conditions fail
- ✅ Cleaner, declarative code
- ✅ Engine handles all validation logic

---

## Benefit 2: Combining Multiple Outputs in One Transaction

### Without Contributions

You need to manually coordinate multiple plugin calls:

```typescript
// Old way: Multiple manual plugin calls
class PurchaseFeature {
  constructor(private engine: LudiekEngine) {}

  purchaseGenerator(generatorId: string) {
    // Risk: If one fails, you have to manually rollback others
    this.engine.plugins.generator.activateGenerator(generatorId);
    this.engine.plugins.achievement.unlock('first-generator');
    this.engine.plugins.statistic.increment('generators-owned');
    this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });

    // What if the achievement unlock fails?
    // You now have an activated generator but no achievement!
  }
}
```

### With Contributions

Atomic transaction with multiple outputs:

```typescript
// New way: Single atomic transaction
class PurchaseFeature {
  constructor(private engine: LudiekEngine) {}

  purchaseGenerator(generatorId: string) {
    const completed = this.engine.handleTransaction({
      requirement: {
        type: '/currency/has',
        id: 'gold',
        amount: 100
      },
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: 100
      },
      output: [
        { type: '/generator/activate', id: generatorId },
        { type: '/achievement/unlock', id: 'first-generator' },
        { type: '/statistic/increment', id: 'generators-owned', amount: 1 }
      ]
    });

    // Either all succeed or none do
    return completed;
  }
}
```

**Benefits:**
- ✅ Multiple effects as one atomic operation
- ✅ No partial state corruption
- ✅ Easier to reason about
- ✅ Better for save/load consistency

---

## Benefit 3: Reusable Transaction Patterns

### Without Contributions

Duplicate logic across multiple features:

```typescript
// Old way: Repeated logic
class UpgradeFeature {
  activateGenerator(generatorId: string) {
    if (this.engine.plugins.currency.getAmount('gold') >= 100) {
      this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });
      this.engine.plugins.generator.activateGenerator(generatorId);
    }
  }
}

class CouponFeature {
  activateGenerator(generatorId: string) {
    if (this.engine.plugins.currency.getAmount('gold') >= 100) {
      this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });
      this.engine.plugins.generator.activateGenerator(generatorId);
    }
  }
}

class QuestFeature {
  activateGenerator(generatorId: string) {
    if (this.engine.plugins.currency.getAmount('gold') >= 100) {
      this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });
      this.engine.plugins.generator.activateGenerator(generatorId);
    }
  }
}
```

### With Contributions

Define once, use everywhere:

```typescript
// New way: Reusable transaction patterns
class GeneratorActivationPatterns {
  static basicPurchase(generatorId: string, cost: number) {
    return {
      requirement: {
        type: '/currency/has',
        id: 'gold',
        amount: cost
      },
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: cost
      },
      output: {
        type: '/generator/activate',
        id: generatorId
      }
    } as const;
  }

  static premiumPurchase(generatorId: string, cost: number, requiresUpgrade: string) {
    return {
      requirement: {
        type: '/and',
        conditions: [
          { type: '/currency/has', id: 'gold', amount: cost },
          { type: '/upgrade/is-unlocked', id: requiresUpgrade }
        ]
      },
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: cost
      },
      output: [
        { type: '/generator/activate', id: generatorId },
        { type: '/achievement/unlock', id: 'premium-generator' }
      ]
    } as const;
  }
}

// Usage in features
class UpgradeFeature {
  constructor(private engine: LudiekEngine) {}

  activateGenerator(generatorId: string) {
    return this.engine.handleTransaction(
      GeneratorActivationPatterns.basicPurchase(generatorId, 100)
    );
  }
}

class CouponFeature {
  constructor(private engine: LudiekEngine) {}

  activateGenerator(generatorId: string) {
    // 50% off!
    return this.engine.handleTransaction(
      GeneratorActivationPatterns.basicPurchase(generatorId, 50)
    );
  }
}

class QuestFeature {
  constructor(private engine: LudiekEngine) {}

  completeQuest(generatorId: string) {
    // Free generator from quest!
    return this.engine.handleTransaction({
      output: {
        type: '/generator/activate',
        id: generatorId
      }
    });
  }
}
```

**Benefits:**
- ✅ DRY principle - define once, use everywhere
- ✅ Easy to adjust costs/conditions centrally
- ✅ Consistent behavior across game
- ✅ Easier testing of patterns

---

## Benefit 4: Conditional Deactivation with Cleanup

### Without Contributions

Manual cleanup when deactivating:

```typescript
// Old way: Manual cleanup logic
class GeneratorManager {
  constructor(private engine: LudiekEngine) {}

  deactivateGenerator(generatorId: string) {
    // Check if it's active
    if (!this.engine.plugins.generator.isGeneratorActive(generatorId)) {
      return;
    }

    // Deactivate
    this.engine.plugins.generator.deactivateGenerator(generatorId);

    // Manual cleanup - easy to forget!
    this.engine.plugins.achievement.lock('active-generator-badge');
    this.engine.plugins.statistic.decrement('active-generators');
    this.engine.plugins.bonus.remove('generator-bonus', generatorId);

    // What if one of these fails? Inconsistent state!
  }
}
```

### With Contributions

Atomic deactivation with cleanup:

```typescript
// New way: Atomic deactivation
class GeneratorManager {
  constructor(private engine: LudiekEngine) {}

  deactivateGenerator(generatorId: string) {
    const completed = this.engine.handleTransaction({
      requirement: {
        type: '/generator/is-active',
        id: generatorId
      },
      output: [
        { type: '/generator/deactivate', id: generatorId },
        { type: '/achievement/lock', id: 'active-generator-badge' },
        { type: '/statistic/decrement', id: 'active-generators', amount: 1 },
        { type: '/bonus/remove', type: 'generator-bonus', id: generatorId }
      ]
    });

    return completed;
  }
}
```

**Benefits:**
- ✅ All cleanup happens atomically
- ✅ No orphaned state
- ✅ Easy to add/remove cleanup steps
- ✅ Consistent deactivation logic

---

## Benefit 5: Easy Testing and Mocking

### Without Contributions

Need to mock entire plugin:

```typescript
// Old way: Testing requires mocking full plugin
describe('GeneratorManager', () => {
  it('activates generator correctly', () => {
    const generatorPlugin = {
      activateGenerator: vi.fn(),
      isGeneratorActive: vi.fn().mockReturnValue(false)
    };

    const currencyPlugin = {
      getAmount: vi.fn().mockReturnValue(100),
      spendCurrency: vi.fn()
    };

    const manager = new GeneratorManager({ plugins: { generator: generatorPlugin, currency: currencyPlugin } });
    manager.activateGenerator('test-gen');

    expect(generatorPlugin.activateGenerator).toHaveBeenCalledWith('test-gen');
    // But we didn't test the actual transaction logic!
  });
});
```

### With Contributions

Test transactions directly:

```typescript
// New way: Test transaction logic
describe('GeneratorActivationPatterns', () => {
  it('activates generator with correct transaction', () => {
    const engine = new LudiekEngine({
      plugins: [generatorPlugin, currencyPlugin],
      consumers: [spendCurrencyConsumer],
      producers: [activateGeneratorProducer, gainCurrencyProducer]
    });

    const transaction = GeneratorActivationPatterns.basicPurchase('test-gen', 100);

    const completed = engine.handleTransaction(transaction);

    expect(completed).toBe(true);
    expect(generatorPlugin.isGeneratorActive('test-gen')).toBe(true);
    expect(currencyPlugin.getAmount('gold')).toBe(0); // Spent 100
  });

  it('fails when not enough gold', () => {
    currencyPlugin.setAmount('gold', 50); // Not enough

    const transaction = GeneratorActivationPatterns.basicPurchase('test-gen', 100);

    const completed = engine.handleTransaction(transaction);

    expect(completed).toBe(false);
    expect(generatorPlugin.isGeneratorActive('test-gen')).toBe(false); // Not activated
    expect(currencyPlugin.getAmount('gold')).toBe(50); // Didn't spend anything
  });
});
```

**Benefits:**
- ✅ Test actual transaction flow
- ✅ Verify atomicity
- ✅ Easy to test edge cases
- ✅ No need for complex mocks

---

## Benefit 6: Future-Extensibility

### Without Contributions

Hard to add new effects later:

```typescript
// Old way: Modify existing code when adding new features
class UpgradeFeature {
  activateGenerator(generatorId: string) {
    if (this.engine.plugins.currency.getAmount('gold') >= 100) {
      this.engine.plugins.currency.spendCurrency({ id: 'gold', amount: 100 });
      this.engine.plugins.generator.activateGenerator(generatorId);

      // New feature: Send notification
      // Need to modify existing code!
      this.engine.plugins.notification.send({
        type: 'info',
        message: 'Generator activated!'
      });
    }
  }
}
```

### With Contributions

Add new effects without changing transaction logic:

```typescript
// New way: Add modifiers to extend behavior
class GeneratorActivationPatterns {
  static basicPurchase(generatorId: string, cost: number) {
    return {
      requirement: {
        type: '/currency/has',
        id: 'gold',
        amount: cost
      },
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: cost
      },
      output: {
        type: '/generator/activate',
        id: generatorId
      }
    } as const;
  }
}

// Add a modifier that automatically sends notifications
class NotificationModifier extends LudiekModifier {
  readonly type = '/notification/auto-notify';

  stringify(bonus: AutoNotifyBonus): string {
    return `auto-notify:${bonus.event}`;
  }

  modify(output: BaseOutput): BaseOutput {
    if (output.type === '/generator/activate') {
      // Automatically send notification when generator is activated
      this.engine.plugins.notification.send({
        type: 'info',
        message: `Generator ${output.id} activated!`
      });
    }
    return output;
  }
}

// Register the modifier and all generator activations get notifications
const engine = new LudiekEngine({
  // ... other config
  modifiers: [new NotificationModifier()]
});

// Now all generator activations automatically send notifications
// without changing the transaction patterns!
```

**Benefits:**
- ✅ Open/Closed Principle - open for extension, closed for modification
- ✅ Add new behavior without changing existing code
- ✅ Composable with modifiers
- ✅ Easier to maintain

---

## Summary of Benefits

| Benefit | Description |
|---------|-------------|
| **Atomicity** | All-or-nothing execution prevents partial state corruption |
| **Declarative** | Describe what to do, not how to do it |
| **Reusable** | Define transaction patterns once, use everywhere |
| **Composable** | Combine multiple effects in single transaction |
| **Testable** | Test transaction flow directly, easier mocking |
| **Extensible** | Add new effects via modifiers without changing code |
| **Consistent** | Engine handles all validation logic uniformly |
| **Type-Safe** | TypeScript ensures transaction validity at compile-time |

The contribution pattern transforms generator activation/deactivation from direct imperative operations into composable, testable, and maintainable transaction-based workflows.
