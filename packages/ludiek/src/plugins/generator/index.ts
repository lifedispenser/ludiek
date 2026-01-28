// Plugin
export { GeneratorPlugin } from './GeneratorPlugin';
export type { GeneratorDefinition } from './GeneratorDefinition';
export { type GeneratorPluginState, createGeneratorState } from './GeneratorPluginState';

// Events
export type { GeneratorActivated, GeneratorDeactivated, GeneratorTickFailed } from './GeneratorEvents';

// Errors
export { UnknownGeneratorError } from './GeneratorErrors';

// Optional contributions
export { ActivateGeneratorProducer, type ActivateGeneratorOutput } from './contributions/ActivateGenerator';
export { DeactivateGeneratorProducer, type DeactivateGeneratorOutput } from './contributions/DeactivateGenerator';
export { IsGeneratorActiveEvaluator, type IsGeneratorActiveCondition } from './contributions/IsGeneratorActive';
