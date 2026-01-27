import { LudiekProducer, BaseOutput } from '@ludiek/engine/output/LudiekProducer';
import { LudiekDependencies } from '@ludiek/engine/LudiekEngineConcept';
import { GeneratorPlugin } from '../GeneratorPlugin';

export interface DeactivateGeneratorOutput extends BaseOutput {
  type: '/generator/deactivate';
  id: string;
}

type Dependencies = LudiekDependencies & {
  plugins: { generator: GeneratorPlugin };
};

export class DeactivateGeneratorProducer extends LudiekProducer<DeactivateGeneratorOutput, Dependencies> {
  readonly type = '/generator/deactivate';

  canProduce(output: DeactivateGeneratorOutput): boolean {
    const generatorPlugin = this.engine.plugins.generator as unknown as GeneratorPlugin;
    return generatorPlugin.supportsGenerator(output.id);
  }

  produce(output: DeactivateGeneratorOutput): void {
    const generatorPlugin = this.engine.plugins.generator as unknown as GeneratorPlugin;
    generatorPlugin.deactivateGenerator(output.id);
  }
}
