import { beforeEach, expect, it } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { IsGeneratorActiveEvaluator } from '@ludiek/plugins/generator/contributions/IsGeneratorActive';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';

const generatorPlugin = new GeneratorPlugin();
const evaluator = new IsGeneratorActiveEvaluator();
const alwaysProducer = new AlwaysProducer();

new LudiekEngine({
  plugins: [generatorPlugin],
  evaluators: [evaluator],
  producers: [alwaysProducer],
});

const generators = [
  { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
  { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
];

beforeEach(() => {
  generatorPlugin.loadContent(generators);
});

it('evaluates condition for inactive generator', () => {
  // Arrange
  const condition = {
    type: '/generator/is-active' as const,
    id: 'gold-generator',
  };

  // Act
  const result = evaluator.evaluate(condition);

  // Assert
  expect(result).toBe(false);
});

it('evaluates condition for active generator', () => {
  // Arrange
  generatorPlugin.activateGenerator('iron-generator');
  const condition = {
    type: '/generator/is-active' as const,
    id: 'iron-generator',
  };

  // Act
  const result = evaluator.evaluate(condition);

  // Assert
  expect(result).toBe(true);
});

it('evaluates condition after deactivation', () => {
  // Arrange
  generatorPlugin.activateGenerator('gold-generator');
  const condition = {
    type: '/generator/is-active' as const,
    id: 'gold-generator',
  };

  // Act
  generatorPlugin.deactivateGenerator('gold-generator');
  const result = evaluator.evaluate(condition);

  // Assert
  expect(result).toBe(false);
});
