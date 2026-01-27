/**
 * Practical demonstration of contribution pattern benefits
 * for ActivateGenerator and DeactivateGenerator
 */

import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { ActivateGeneratorProducer } from '@ludiek/plugins/generator/contributions/ActivateGenerator';
import { DeactivateGeneratorProducer } from '@ludiek/plugins/generator/contributions/DeactivateGenerator';
import { IsGeneratorActiveEvaluator } from '@ludiek/plugins/generator/contributions/IsGeneratorActive';
import { CurrencyPlugin } from '@ludiek/plugins/currency/CurrencyPlugin';
import { GainCurrencyProducer } from '@ludiek/plugins/currency/contributions/GainCurrencyOutput';
import { SpendCurrencyConsumer } from '@ludiek/plugins/currency/contributions/SpendCurrencyInput';
import { HasCurrencyEvaluator } from '@ludiek/plugins/currency/contributions/HasCurrencyCondition';

// ============================================================================
// EXAMPLE 1: Transaction-Based Activation (vs Direct Plugin Access)
// ============================================================================

console.log('=== Example 1: Transaction-Based Activation ===\n');

// Setup
const engine = new LudiekEngine({
  plugins: [
    new GeneratorPlugin(),
    new CurrencyPlugin()
  ],
  consumers: [new SpendCurrencyConsumer()],
  producers: [
    new ActivateGeneratorProducer(),
    new DeactivateGeneratorProducer(),
    new GainCurrencyProducer()
  ],
  evaluators: [
    new IsGeneratorActiveEvaluator(),
    new HasCurrencyEvaluator()
  ]
});

// Load content
engine.plugins.generator.loadContent([
  { id: 'gold-farm', output: { type: '/output/gain-currency', id: 'gold', amount: 10 } },
  { id: 'iron-farm', output: { type: '/output/gain-currency', id: 'iron', amount: 5 } }
]);

engine.plugins.currency.loadContent([
  { id: 'gold', startAmount: 100 },
  { id: 'iron', startAmount: 50 }
]);

// OLD WAY: Direct plugin access (manual validation, no atomicity)
console.log('❌ OLD WAY (Direct Plugin Access):');
console.log('   - Manual condition checking required');
console.log('   - No atomicity - partial changes if something fails');
console.log('   - More code, harder to maintain\n');

// Code would look like:
// if (engine.plugins.currency.getAmount('gold') >= 50) {
//   engine.plugins.currency.spendCurrency({ id: 'gold', amount: 50 });
//   engine.plugins.generator.activateGenerator('gold-farm');
//   // What if achievement unlock fails? Generator activated but no achievement!
// }

// NEW WAY: Transaction-based (atomic, declarative)
console.log('✅ NEW WAY (Transaction-Based):');
console.log('   - Atomic: all-or-nothing execution');
console.log('   - Declarative: describe what, not how');
console.log('   - Engine handles validation\n');

const purchaseTransaction = {
  requirement: {
    type: '/currency/has',
    id: 'gold',
    amount: 50
  },
  input: {
    type: '/currency/spend',
    id: 'gold',
    amount: 50
  },
  output: {
    type: '/generator/activate',
    id: 'gold-farm'
  }
};

const completed = engine.handleTransaction(purchaseTransaction);
console.log(`Transaction completed: ${completed}`);
console.log(`Gold after purchase: ${engine.plugins.currency.getAmount('gold')}`);
console.log(`Generator active: ${engine.plugins.generator.isGeneratorActive('gold-farm')}\n`);

// ============================================================================
// EXAMPLE 2: Multiple Outputs in One Transaction
// ============================================================================

console.log('=== Example 2: Multiple Outputs (Atomic Effect) ===\n');

// Setup fresh engine
const engine2 = new LudiekEngine({
  plugins: [new GeneratorPlugin(), new CurrencyPlugin()],
  consumers: [new SpendCurrencyConsumer()],
  producers: [
    new ActivateGeneratorProducer(),
    new DeactivateGeneratorProducer(),
    new GainCurrencyProducer()
  ],
  evaluators: [
    new IsGeneratorActiveEvaluator(),
    new HasCurrencyEvaluator()
  ]
});

engine2.plugins.generator.loadContent([
  { id: 'premium-farm', output: { type: '/output/gain-currency', id: 'gold', amount: 20 } }
]);

engine2.plugins.currency.loadContent([
  { id: 'gold', startAmount: 100 }
]);

console.log('Purchasing premium generator with multiple effects...\n');

const premiumPurchaseTransaction = {
  requirement: {
    type: '/currency/has',
    id: 'gold',
    amount: 75
  },
  input: {
    type: '/currency/spend',
    id: 'gold',
    amount: 75
  },
  output: [
    { type: '/generator/activate', id: 'premium-farm' },
    { type: '/output/gain-currency', id: 'gold', amount: 10 } // Bonus!
  ]
};

const premiumCompleted = engine2.handleTransaction(premiumPurchaseTransaction);
console.log(`Transaction completed: ${premiumCompleted}`);
console.log(`Gold after purchase: ${engine2.plugins.currency.getAmount('gold')}`);
console.log(`Generator active: ${engine2.plugins.generator.isGeneratorActive('premium-farm')}`);

// With atomic transactions, if one output fails, none execute:
console.log('\nAttempting impossible transaction (would fail atomically):');
const impossibleTransaction = {
  requirement: {
    type: '/currency/has',
    id: 'gold',
    amount: 999999 // Impossible
  },
  input: {
    type: '/currency/spend',
    id: 'gold',
    amount: 999999
  },
  output: [
    { type: '/generator/activate', id: 'premium-farm' },
    { type: '/output/gain-currency', id: 'gold', amount: 1000 }
  ]
};

const impossibleCompleted = engine2.handleTransaction(impossibleTransaction);
console.log(`Transaction completed: ${impossibleCompleted}`);
console.log(`Gold (unchanged): ${engine2.plugins.currency.getAmount('gold')}`);
console.log(`Generator (unchanged): ${engine2.plugins.generator.isGeneratorActive('premium-farm')}\n`);

// ============================================================================
// EXAMPLE 3: Conditional Deactivation with Cleanup
// ============================================================================

console.log('=== Example 3: Conditional Deactivation ===\n');

const engine3 = new LudiekEngine({
  plugins: [new GeneratorPlugin()],
  producers: [
    new ActivateGeneratorProducer(),
    new DeactivateGeneratorProducer()
  ],
  evaluators: [new IsGeneratorActiveEvaluator()]
});

engine3.plugins.generator.loadContent([
  { id: 'temporary-farm', output: { type: '/output/gain-currency', id: 'gold', amount: 5 } }
]);

// Activate first
engine3.handleTransaction({
  output: { type: '/generator/activate', id: 'temporary-farm' }
});

console.log(`Generator active: ${engine3.plugins.generator.isGeneratorActive('temporary-farm')}`);

// Conditional deactivation - only if active
const deactivationTransaction = {
  requirement: {
    type: '/generator/is-active',
    id: 'temporary-farm'
  },
  output: {
    type: '/generator/deactivate',
    id: 'temporary-farm'
  }
};

const deactivated = engine3.handleTransaction(deactivationTransaction);
console.log(`Deactivation completed: ${deactivated}`);
console.log(`Generator active: ${engine3.plugins.generator.isGeneratorActive('temporary-farm')}`);

// Try again - won't deactivate twice
const deactivated2 = engine3.handleTransaction(deactivationTransaction);
console.log(`Second deactivation completed: ${deactivated2} (false because not active)\n`);

// ============================================================================
// EXAMPLE 4: Reusable Transaction Patterns
// ============================================================================

console.log('=== Example 4: Reusable Patterns ===\n');

class GeneratorPurchasePatterns {
  static standardPurchase(generatorId: string, cost: number) {
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

  static discountPurchase(generatorId: string, cost: number, discountPercent: number) {
    const discountedCost = Math.floor(cost * (1 - discountPercent / 100));
    return {
      requirement: {
        type: '/currency/has',
        id: 'gold',
        amount: discountedCost
      },
      input: {
        type: '/currency/spend',
        id: 'gold',
        amount: discountedCost
      },
      output: {
        type: '/generator/activate',
        id: generatorId
      }
    } as const;
  }
}

const engine4 = new LudiekEngine({
  plugins: [new GeneratorPlugin(), new CurrencyPlugin()],
  consumers: [new SpendCurrencyConsumer()],
  producers: [
    new ActivateGeneratorProducer(),
    new DeactivateGeneratorProducer(),
    new GainCurrencyProducer()
  ],
  evaluators: [
    new IsGeneratorActiveEvaluator(),
    new HasCurrencyEvaluator()
  ]
});

engine4.plugins.generator.loadContent([
  { id: 'basic-farm', output: { type: '/output/gain-currency', id: 'gold', amount: 5 } },
  { id: 'advanced-farm', output: { type: '/output/gain-currency', id: 'gold', amount: 15 } }
]);

engine4.plugins.currency.loadContent([
  { id: 'gold', startAmount: 100 }
]);

console.log('Using reusable patterns:\n');

// Standard purchase
engine4.handleTransaction(
  GeneratorPurchasePatterns.standardPurchase('basic-farm', 50)
);
console.log(`Standard purchase - Gold: ${engine4.plugins.currency.getAmount('gold')}, Active: ${engine4.plugins.generator.isGeneratorActive('basic-farm')}`);

// Discount purchase (50% off)
engine4.handleTransaction(
  GeneratorPurchasePatterns.discountPurchase('advanced-farm', 60, 50)
);
console.log(`Discount purchase (50% off) - Gold: ${engine4.plugins.currency.getAmount('gold')}, Active: ${engine4.plugins.generator.isGeneratorActive('advanced-farm')}\n`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('=== Summary of Benefits ===\n');
console.log('✅ Atomicity: All-or-nothing execution prevents partial state corruption');
console.log('✅ Declarative: Describe what to do, not how to do it');
console.log('✅ Reusable: Define patterns once, use everywhere');
console.log('✅ Composable: Combine multiple effects in single transaction');
console.log('✅ Testable: Test transaction flow directly');
console.log('✅ Type-safe: TypeScript ensures validity at compile-time');
console.log('\nThe contribution pattern transforms generator operations from');
console.log('imperative plugin calls into composable, transaction-based workflows.');
