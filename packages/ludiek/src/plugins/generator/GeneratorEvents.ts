import { GeneratorDefinition } from './GeneratorDefinition';

export interface GeneratorActivated {
  generatorId: string;
  generatorDefinition: GeneratorDefinition;
}

export interface GeneratorDeactivated {
  generatorId: string;
  generatorDefinition: GeneratorDefinition;
}

export interface GeneratorTickFailed {
  generatorId: string;
  reason: 'conditions_not_met' | 'cannot_consume_input' | 'cannot_produce_output';
}
