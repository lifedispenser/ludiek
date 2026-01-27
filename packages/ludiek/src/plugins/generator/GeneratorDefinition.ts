import { BaseOutput } from '@ludiek/engine/output/LudiekProducer';
import { BaseInput } from '@ludiek/engine/input/LudiekConsumer';
import { BaseCondition } from '@ludiek/engine/condition/LudiekEvaluator';

export interface GeneratorDefinition {
  id: string;
  output: BaseOutput | BaseOutput[];
  input?: BaseInput | BaseInput[];
  conditions?: BaseCondition | BaseCondition[];
}
