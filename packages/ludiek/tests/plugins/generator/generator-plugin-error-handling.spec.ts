import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { UnknownGeneratorError } from '@ludiek/plugins/generator/GeneratorErrors';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';
import { AlwaysConsumer } from '@tests/shared/AlwaysInput';
import { NeverProducer } from '@tests/shared/NeverOutput';
import { NeverConsumer } from '@tests/shared/NeverInput';
import { TrueEvaluator } from '@ludiek/stdlib/condition/TrueCondition';
import { FalseEvaluator } from '@ludiek/stdlib/condition/FalseCondition';

const generatorPlugin = new GeneratorPlugin();
const engine = new LudiekEngine({
  plugins: [generatorPlugin],
  consumers: [new NeverConsumer(), new AlwaysConsumer()],
  producers: [new NeverProducer(), new AlwaysProducer()],
  evaluators: [new TrueEvaluator(), new FalseEvaluator()],
});

beforeEach(() => {
  generatorPlugin.loadContent([
    { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
    { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
    { id: 'mixed-generator', output: { type: '/output/always', amount: 15 }, input: { type: '/input/always', amount: 3 } },
    { id: 'conditional-generator', output: { type: '/output/always', amount: 8 }, conditions: { type: '/condition/true' } },
  ]);
});

describe('Error handling', () => {
  describe('UnknownGeneratorError', () => {
    it('throws UnknownGeneratorError when getting non-existent generator', () => {
      // Arrange & Act & Assert
      expect(() => generatorPlugin.getGenerator('unknown')).toThrow(UnknownGeneratorError);
      expect(() => generatorPlugin.getGenerator('unknown')).toThrow('Unknown generator with id');
    });

    it('throws UnknownGeneratorError when activating non-existent generator', () => {
      // Arrange & Act & Assert
      expect(() => generatorPlugin.activateGenerator('unknown')).toThrow(UnknownGeneratorError);
    });

    it('throws UnknownGeneratorError when deactivating non-existent generator', () => {
      // Arrange & Act & Assert
      expect(() => generatorPlugin.deactivateGenerator('unknown')).toThrow(UnknownGeneratorError);
    });

    it('throws UnknownGeneratorError when checking active status of non-existent generator', () => {
      // Arrange & Act & Assert
      expect(() => generatorPlugin.isGeneratorActive('unknown')).toThrow(UnknownGeneratorError);
    });
  });

  describe('tick() failures', () => {
    it('fails when conditions are not met', () => {
      // Arrange
      const pluginWithFalseCondition = new GeneratorPlugin();
      new LudiekEngine({
        plugins: [pluginWithFalseCondition],
        producers: [new AlwaysProducer()],
        evaluators: [new FalseEvaluator()],
      });
      pluginWithFalseCondition.loadContent([
        { id: 'false-condition-generator', output: { type: '/output/always', amount: 10 }, conditions: { type: '/condition/false' } },
      ]);
      pluginWithFalseCondition.activateGenerator('false-condition-generator');
      const produceSpy = vi.spyOn(engine, 'produce');

      // Act
      pluginWithFalseCondition.tick(1);

      // Assert
      expect(produceSpy).not.toHaveBeenCalled();
    });

    it('fails when cannot consume input', () => {
      // Arrange
      const pluginWithNeverInput = new GeneratorPlugin();
      new LudiekEngine({
        plugins: [pluginWithNeverInput],
        producers: [new AlwaysProducer()],
        consumers: [new NeverConsumer()],
      });
      pluginWithNeverInput.loadContent([
        { id: 'never-input-generator', output: { type: '/output/always', amount: 10 }, input: { type: '/input/never', amount: 5 } },
      ]);
      pluginWithNeverInput.activateGenerator('never-input-generator');
      const produceSpy = vi.spyOn(engine, 'produce');
      const consumeSpy = vi.spyOn(engine, 'consume');

      // Act
      pluginWithNeverInput.tick(1);

      // Assert
      expect(consumeSpy).not.toHaveBeenCalled();
      expect(produceSpy).not.toHaveBeenCalled();
    });

    it('fails when cannot produce output', () => {
      // Arrange
      const pluginWithNeverOutput = new GeneratorPlugin();
      new LudiekEngine({
        plugins: [pluginWithNeverOutput],
        producers: [new NeverProducer()],
      });
      pluginWithNeverOutput.loadContent([
        { id: 'never-output-generator', output: { type: '/output/never', amount: 10 } },
      ]);
      pluginWithNeverOutput.activateGenerator('never-output-generator');
      const produceSpy = vi.spyOn(engine, 'produce');

      // Act
      pluginWithNeverOutput.tick(1);

      // Assert
      expect(produceSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('activating already active generator does not cause issues', () => {
      // Arrange
      generatorPlugin.activateGenerator('gold-generator');

      // Act & Assert
      expect(() => generatorPlugin.activateGenerator('gold-generator')).not.toThrow();
      expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(true);
    });

    it('deactivating already inactive generator does not cause issues', () => {
      // Arrange
      const isActive = generatorPlugin.isGeneratorActive('gold-generator');
      expect(isActive).toBe(false);

      // Act & Assert
      expect(() => generatorPlugin.deactivateGenerator('gold-generator')).not.toThrow();
      expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(false);
    });
  });
});
