import { beforeEach, expect, it } from 'vitest';
import { GeneratorPlugin } from '@ludiek/plugins/generator/GeneratorPlugin';
import { LudiekEngine } from '@ludiek/engine/LudiekEngine';
import { ActivateGeneratorProducer } from '@ludiek/plugins/generator/contributions/ActivateGenerator';
import { AlwaysProducer } from '@tests/shared/AlwaysOutput';

const generatorPlugin = new GeneratorPlugin();
const producer = new ActivateGeneratorProducer();
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

it('checks if we can activate generator', () => {
  // Act
  const canProduce = producer.canProduce({
    type: '/generator/activate',
    id: 'gold-generator',
    amount: 1,
  });

  // Assert
  expect(canProduce).toBe(true);
});

it('activates generator via output', () => {
  // Arrange
  expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(false);

  // Act
  producer.produce({
    type: '/generator/activate',
    id: 'gold-generator',
    amount: 1,
  });

  // Assert
  expect(generatorPlugin.isGeneratorActive('gold-generator')).toBe(true);
});

it('activates different generator via output', () => {
  // Arrange
  expect(generatorPlugin.isGeneratorActive('iron-generator')).toBe(false);

  // Act
  producer.produce({
    type: '/generator/activate',
    id: 'iron-generator',
    amount: 1,
  });

  // Assert
  expect(generatorPlugin.isGeneratorActive('iron-generator')).toBe(true);
});
