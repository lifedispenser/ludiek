import { beforeEach, expect, it } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { DeactivateGeneratorProducer } from '@ludiek/plugins/generator/contributions/DeactivateGenerator';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';

const generatorPlugin = new GeneratorPlugin();
const producer = new DeactivateGeneratorProducer();
const alwaysProducer = new AlwaysProducer();

new LudiekEngine({
  plugins: [generatorPlugin],
  producers: [producer, alwaysProducer],
});

const generators = [
  { id: 'gold-generator', output: { type: '/output/always', amount: 10 } },
  { id: 'iron-generator', output: { type: '/output/always', amount: 5 } },
];

beforeEach(() => {
  generatorPlugin.loadContent(generators);
});

it('checks if we can deactivate generator', () => {
  // Act
  const canProduce = producer.canProduce({
    type: '/generator/deactivate',
    id: 'gold-generator',
    amount: 1,
  });

  // Assert
  expect(canProduce).toBe(true);
});

it('deactivates generator via output', () => {
  // Arrange
  generatorPlugin.activateGenerator('gold-generator');
  expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(true);

  // Act
  producer.produce({
    type: '/generator/deactivate',
    id: 'gold-generator',
    amount: 1,
  });

  // Assert
  expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(false);
});

it('deactivates different generator via output', () => {
  // Arrange
  generatorPlugin.activateGenerator('iron-generator');
  expect(generatorPlugin.isGeneratorActive('iron-generator')).toBe(true);

  // Act
  producer.produce({
    type: '/generator/deactivate',
    id: 'iron-generator',
    amount: 1,
  });

  // Assert
  expect(generatorPlugin.isGeneratorActive('iron-generator')).toBe(false);
});
