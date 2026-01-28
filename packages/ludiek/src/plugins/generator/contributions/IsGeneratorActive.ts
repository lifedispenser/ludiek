import { LudiekEvaluator, BaseCondition } from '@ludiek/engine/condition/LudiekEvaluator';
import { LudiekDependencies } from '@ludiek/engine/LudiekEngineConcept';
import { GeneratorPlugin } from '../GeneratorPlugin';

export interface IsGeneratorActiveCondition extends BaseCondition {
  type: '/generator/is-active';
  id: string;
}

type Dependencies = LudiekDependencies & {
  plugins: { generator: GeneratorPlugin };
};

export class IsGeneratorActiveEvaluator extends LudiekEvaluator<IsGeneratorActiveCondition, Dependencies> {
  readonly type = '/generator/is-active';

  evaluate(condition: IsGeneratorActiveCondition): boolean {
    const generatorPlugin = this.engine.plugins.generator as unknown as GeneratorPlugin;
    return generatorPlugin.isGeneratorActive(condition.id);
  }
}
