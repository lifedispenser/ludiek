import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { type GeneratorTicked } from '@ludiek/plugins/generator/GeneratorEvents';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';
import { AlwaysConsumer } from '@tests/shared/AlwaysInput';

describe('Happy flow', () => {
  it('instantiates with generators as inactive', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
    ]);

    // Act
    const goldActive = generatorPlugin.isGeneratorActive('gold-generator');
    const ironActive = generatorPlugin.isGeneratorActive('iron-generator');

    // Assert
    expect(goldActive).toBe(false);
    expect(ironActive).toBe(false);
  });

  it('activates generator', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);

    // Act
    generatorPlugin.activateGenerator('gold-generator');

    // Assert
    expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(true);
  });

  it('deactivates generator', () => {
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
    expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(true);

    // Act
    generatorPlugin.deactivateGenerator('gold-generator');

    // Assert
    expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(false);
  });

  it('supports loaded generators', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
    ]);

    // Act
    const supportsGold = generatorPlugin.supportsGenerator('gold-generator');
    const supportsIron = generatorPlugin.supportsGenerator('iron-generator');
    const supportsUnknown = generatorPlugin.supportsGenerator('unknown');

    // Assert
    expect(supportsGold).toBe(true);
    expect(supportsIron).toBe(true);
    expect(supportsUnknown).toBe(false);
  });

  it('retrieves generator definition', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    ]);

    // Act
    const goldGenerator = generatorPlugin.getGenerator('gold-generator');

    // Assert
    expect(goldGenerator.id).toBe('gold-generator');
    expect(goldGenerator.output).toEqual({ type: '/output/always', amount: 10 });
  });

  it('returns all generators', () => {
    // Arrange
    const generatorPlugin = new GeneratorPlugin();
    const engine = new LudiekEngine({
      plugins: [generatorPlugin],
      producers: [new AlwaysProducer()],
    });
    generatorPlugin.loadContent([
      { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
      { id: 'mixed-generator', output: { type: '/output/always', amount: 15 }, input: { type: '/input/always', amount: 3 } },
    ]);

    // Act
    const generators = generatorPlugin.generators;

    // Assert
    expect(generators).toHaveLength(3);
    expect(generators.map((g) => g.id)).toContain('gold-generator');
    expect(generators.map((g) => g.id)).toContain('iron-generator');
    expect(generators.map((g) => g.id)).toContain('mixed-generator');
  });

  describe('tick() with output only', () => {
    it('produces output for active generators', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      const produceSpy = vi.spyOn(engine, 'produce');
      const tickedEvents: GeneratorTicked[] = [];
      generatorPlugin.onGeneratorTicked.subscribe((e) => tickedEvents.push(e));

      // Act
      generatorPlugin.tick(1);

      // Assert
      expect(produceSpy).toHaveBeenCalled();
      expect(tickedEvents).toHaveLength(1);
      expect(tickedEvents[0].generatorId).toBe('gold-generator');
      expect(tickedEvents[0].delta).toBe(1);
      expect(tickedEvents[0].outputProduced).toEqual({ type: '/output/always', amount: 10 });
    });

    it('skips inactive generators', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      ]);
      const produceSpy = vi.spyOn(engine, 'produce');

      // Act
      generatorPlugin.tick(1);

      // Assert
      expect(produceSpy).not.toHaveBeenCalled();
    });

    it('handles multiple active generators', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
        { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      generatorPlugin.activateGenerator('iron-generator');
      const produceSpy = vi.spyOn(engine, 'produce');

      // Act
      generatorPlugin.tick(1);

      // Assert
      expect(produceSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('tick() with delta scaling', () => {
    it('scales output by delta (1 second)', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      const produceSpy = vi.spyOn(engine, 'produce');
      const tickedEvents: GeneratorTicked[] = [];
      generatorPlugin.onGeneratorTicked.subscribe((e) => tickedEvents.push(e));

      // Act
      generatorPlugin.tick(1);

      // Assert
      expect(produceSpy).toHaveBeenCalled();
      expect(tickedEvents).toHaveLength(1);
      expect(tickedEvents[0].outputProduced).toEqual({ type: '/output/always', amount: 10 });
    });

    it('scales output by delta (0.5 seconds)', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      const produceSpy = vi.spyOn(engine, 'produce');
      const tickedEvents: GeneratorTicked[] = [];
      generatorPlugin.onGeneratorTicked.subscribe((e) => tickedEvents.push(e));

      // Act
      generatorPlugin.tick(0.5);

      // Assert
      expect(produceSpy).toHaveBeenCalled();
      expect(tickedEvents).toHaveLength(1);
      expect(tickedEvents[0].outputProduced).toEqual({ type: '/output/always', amount: 5 });
    });

    it('scales output by delta (2 seconds)', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      const produceSpy = vi.spyOn(engine, 'produce');
      const tickedEvents: GeneratorTicked[] = [];
      generatorPlugin.onGeneratorTicked.subscribe((e) => tickedEvents.push(e));

      // Act
      generatorPlugin.tick(2);

      // Assert
      expect(produceSpy).toHaveBeenCalled();
      expect(tickedEvents).toHaveLength(1);
      expect(tickedEvents[0].outputProduced).toEqual({ type: '/output/always', amount: 20 });
    });
  });

  describe('tick() with input and output', () => {
    it('consumes input and produces output', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const alwaysProducer = new AlwaysProducer();
      const alwaysConsumer = new AlwaysConsumer();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [alwaysProducer],
        consumers: [alwaysConsumer],
      });
      generatorPlugin.loadContent([
        { id: 'mixed-generator', output: { type: '/output/always', amount: 15 }, input: { type: '/input/always', amount: 3 } },
      ]);
      generatorPlugin.activateGenerator('mixed-generator');
      const consumeSpy = vi.spyOn(engine, 'consume').mockReturnValue(true);
      const produceSpy = vi.spyOn(engine, 'produce').mockReturnValue(true);
      const evaluateSpy = vi.spyOn(engine, 'evaluate').mockReturnValue(true);
      const canConsumeSpy = vi.spyOn(engine, 'canConsume').mockReturnValue(true);
      const canProduceSpy = vi.spyOn(engine, 'canProduce').mockReturnValue(true);
      const tickedEvents: GeneratorTicked[] = [];
      generatorPlugin.onGeneratorTicked.subscribe((e) => tickedEvents.push(e));

      // Act
      generatorPlugin.tick(1);

      // Assert
      expect(canConsumeSpy).toHaveBeenCalled();
      expect(consumeSpy).toHaveBeenCalled();
      expect(canProduceSpy).toHaveBeenCalled();
      expect(produceSpy).toHaveBeenCalled();
      expect(tickedEvents).toHaveLength(1);
      expect(tickedEvents[0].generatorId).toBe('mixed-generator');
      expect(tickedEvents[0].delta).toBe(1);
      expect(tickedEvents[0].inputConsumed).toEqual({ type: '/input/always', amount: 3 });
      expect(tickedEvents[0].outputProduced).toEqual({ type: '/output/always', amount: 15 });
    });
  });

  describe('state persistence', () => {
    it('saves and loads state correctly', () => {
      // Arrange
      const generatorPlugin = new GeneratorPlugin();
      const engine = new LudiekEngine({
        plugins: [generatorPlugin],
        producers: [new AlwaysProducer()],
      });
      generatorPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
        { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
      ]);
      generatorPlugin.activateGenerator('gold-generator');
      generatorPlugin.activateGenerator('iron-generator');
      const savedState = generatorPlugin.save();

      // Act
      const newPlugin = new GeneratorPlugin();
      const engine2 = new LudiekEngine({
        plugins: [newPlugin],
        producers: [new AlwaysProducer()],
      });
      newPlugin.loadContent([
        { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
        { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
      ]);
      newPlugin.load(savedState);

      // Assert
      expect(newPlugin.isGeneratorActive('gold-generator')).toBe(true);
      expect(newPlugin.isGeneratorActive('iron-generator')).toBe(true);
    });
  });
});
