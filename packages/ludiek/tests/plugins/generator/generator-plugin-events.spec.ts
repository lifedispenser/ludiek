import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { GeneratorActivated, GeneratorDeactivated, GeneratorTickFailed } from '@ludiek/plugins/generator/GeneratorEvents';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';
import { AlwaysConsumer } from '@tests/shared/AlwaysInput';
import { NeverProducer } from '@tests/shared/NeverOutput';
import { NeverConsumer } from '@tests/shared/NeverInput';
import { FalseEvaluator } from '@ludiek/stdlib/condition/FalseCondition';

describe('GeneratorActivated event', () => {
  it('dispatches GeneratorActivated event when activating generator', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);

    let activatedEvent: GeneratorActivated | undefined;

    const unsub = generatorPlugin.onGeneratorActivated.sub((e) => {
      activatedEvent = e;
    });

    // Act
    generatorPlugin.activateGenerator('gold-generator');

    // After
    unsub();
    expect(activatedEvent).toBeDefined();
    expect(activatedEvent?.generatorId).toBe('gold-generator');
    expect(activatedEvent?.generatorDefinition.id).toBe('gold-generator');
  });

  it('does not dispatch GeneratorActivated when activating already active generator', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);
    generatorPlugin.activateGenerator('gold-generator');

    let dispatchCount = 0;
    const unsub = generatorPlugin.onGeneratorActivated.sub(() => {
      dispatchCount++;
    });

    // Act
    generatorPlugin.activateGenerator('gold-generator');

    // After
    unsub();
    expect(dispatchCount).toBe(0);
  });
});

describe('GeneratorDeactivated event', () => {
  it('dispatches GeneratorDeactivated event when deactivating generator', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);
    generatorPlugin.activateGenerator('gold-generator');
    let deactivatedEvent: GeneratorDeactivated | undefined;

    const unsub = generatorPlugin.onGeneratorDeactivated.sub((e) => {
      deactivatedEvent = e;
    });

    // Act
    generatorPlugin.deactivateGenerator('gold-generator');

    // After
    unsub();
    expect(deactivatedEvent).toBeDefined();
    expect(deactivatedEvent?.generatorId).toBe('gold-generator');
    expect(deactivatedEvent?.generatorDefinition.id).toBe('gold-generator');
  });

  it('does not dispatch GeneratorDeactivated when deactivating already inactive generator', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);

    let dispatchCount = 0;
    const unsub = generatorPlugin.onGeneratorDeactivated.sub(() => {
      dispatchCount++;
    });

    // Act
    generatorPlugin.deactivateGenerator('gold-generator');

    // After
    unsub();
    expect(dispatchCount).toBe(0);
  });
});

describe('GeneratorTickFailed event', () => {
  it('dispatches GeneratorTickFailed when conditions fail', () => {
    // Arrange
    const pluginWithCondition = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [pluginWithCondition],
      producers: [new AlwaysProducer()],
      evaluators: [new FalseEvaluator()],
    });
    pluginWithCondition.loadContent([
      { id: 'conditional-generator', output: { type: '/output/always', amount: 10 }, conditions: { type: '/condition/false' } },
    ]);
    pluginWithCondition.activateGenerator('conditional-generator');

    let failedEvent: GeneratorTickFailed | undefined;
    const unsub = pluginWithCondition.onGeneratorTickFailed.sub((e) => {
      failedEvent = e;
    });

    // Act
    pluginWithCondition.tick(1);

    // After
    unsub();
    expect(failedEvent).toBeDefined();
    expect(failedEvent?.generatorId).toBe('conditional-generator');
    expect(failedEvent?.reason).toBe('conditions_not_met');
  });

  it('dispatches GeneratorTickFailed when input consumption fails', () => {
    // Arrange
    const pluginWithNeverInput = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [pluginWithNeverInput],
      producers: [new AlwaysProducer()],
      consumers: [new NeverConsumer()],
    });
    pluginWithNeverInput.loadContent([
      { id: 'never-input-generator', output: { type: '/output/always', amount: 10 }, input: { type: '/input/never', amount: 5 } },
    ]);
    pluginWithNeverInput.activateGenerator('never-input-generator');

    let failedEvent: GeneratorTickFailed | undefined;
    const unsub = pluginWithNeverInput.onGeneratorTickFailed.sub((e) => {
      failedEvent = e;
    });

    // Act
    pluginWithNeverInput.tick(1);

    // After
    unsub();
    expect(failedEvent).toBeDefined();
    expect(failedEvent?.generatorId).toBe('never-input-generator');
    expect(failedEvent?.reason).toBe('cannot_consume_input');
  });

  it('dispatches GeneratorTickFailed when output production fails', () => {
    // Arrange
    const pluginWithNeverOutput = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [pluginWithNeverOutput],
      producers: [new NeverProducer()],
    });
    pluginWithNeverOutput.loadContent([
      { id: 'never-output-generator', output: { type: '/output/never', amount: 10 } },
    ]);
    pluginWithNeverOutput.activateGenerator('never-output-generator');

    let failedEvent: GeneratorTickFailed | undefined;
    const unsub = pluginWithNeverOutput.onGeneratorTickFailed.sub((e) => {
      failedEvent = e;
    });

    // Act
    pluginWithNeverOutput.tick(1);

    // After
    unsub();
    expect(failedEvent).toBeDefined();
    expect(failedEvent?.generatorId).toBe('never-output-generator');
    expect(failedEvent?.reason).toBe('cannot_produce_output');
  });
});

describe('Multiple event subscriptions', () => {
  it('supports multiple subscribers to the same event', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);

    let count = 0;

    const unsub1 = generatorPlugin.onGeneratorActivated.sub(() => {
      count++;
    });
    const unsub2 = generatorPlugin.onGeneratorActivated.sub(() => {
      count++;
    });

    // Act
    generatorPlugin.activateGenerator('gold-generator');

    // After
    unsub1();
    unsub2();
    expect(count).toBe(2);
  });
});
