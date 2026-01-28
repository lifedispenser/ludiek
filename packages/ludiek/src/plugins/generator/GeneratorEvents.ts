import { GeneratorDefinition } from './GeneratorDefinition';
import { BaseOutput, BaseInput } from '@ludiek/engine/output/LudiekProducer';

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

export interface GeneratorTicked {
  generatorId: string;
  generatorDefinition: GeneratorDefinition;
  delta: number;
  inputConsumed: BaseInput | BaseInput[] | null;
  outputProduced: BaseOutput | BaseOutput[];
}
