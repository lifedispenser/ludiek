import { LudiekProducer, BaseOutput } from '@ludiek/engine/output/LudiekProducer';
import { LudiekDependencies } from '@ludiek/engine/LudiekEngineConcept';
import { GeneratorPlugin } from '../GeneratorPlugin';

export interface ActivateGeneratorOutput extends BaseOutput {
  type: '/generator/activate';
  id: string;
}

type Dependencies = LudiekDependencies & {
  plugins: { generator: GeneratorPlugin };
};

export class ActivateGeneratorProducer extends LudiekProducer<ActivateGeneratorOutput, Dependencies> {
  readonly type = '/generator/activate';

  canProduce(output: ActivateGeneratorOutput): boolean {
    const generatorPlugin = this.engine.plugins.generator as unknown as GeneratorPlugin;
    return generatorPlugin.supportsGenerator(output.id);
  }

  produce(output: ActivateGeneratorOutput): void {
    const generatorPlugin = this.engine.plugins.generator as unknown as GeneratorPlugin;
    generatorPlugin.activateGenerator(output.id);
  }
}
