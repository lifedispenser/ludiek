import { LudiekPlugin } from '@ludiek/engine/LudiekPlugin';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';
import { GeneratorDefinition } from './GeneratorDefinition';
import { createGeneratorState, GeneratorPluginState } from './GeneratorPluginState';
import { BaseOutput } from '@ludiek/engine/output/LudiekProducer';
import { BaseInput } from '@ludiek/engine/input/LudiekConsumer';
import { BaseCondition } from '@ludiek/engine/condition/LudiekEvaluator';
import { UnknownGeneratorError } from './GeneratorErrors';
import { GeneratorActivated, GeneratorDeactivated, GeneratorTickFailed, GeneratorTicked } from './GeneratorEvents';

export class GeneratorPlugin extends LudiekPlugin {
  readonly name = 'generator';
  protected _state: GeneratorPluginState;

  private readonly _generators: Record<string, GeneratorDefinition> = {};

  constructor(state: GeneratorPluginState = createGeneratorState()) {
    super();
    this._state = state;
  }

  public loadContent(generators: GeneratorDefinition[]): void {
    generators.forEach((generator) => {
      this._generators[generator.id] = generator;
      this._state.isActive[generator.id] = false;
    });
  }

  public getGenerator(id: string): GeneratorDefinition {
    this.validate(id);
    return this._generators[id];
  }

  public supportsGenerator(id: string): boolean {
    return this._generators[id] != undefined;
  }

  public get generators(): GeneratorDefinition[] {
    return Object.values(this._generators);
  }

  /**
   * Activate a generator so it produces output on each tick
   * @param id The generator ID
   */
  public activateGenerator(id: string): void {
    this.validate(id);
    const wasActive = this._state.isActive[id];
    this._state.isActive[id] = true;

    if (!wasActive) {
      this._onGeneratorActivated.dispatch({
        generatorId: id,
        generatorDefinition: this._generators[id],
      });
    }
  }

  /**
   * Deactivate a generator so it stops producing output
   * @param id The generator ID
   */
  public deactivateGenerator(id: string): void {
    this.validate(id);
    const wasActive = this._state.isActive[id];
    this._state.isActive[id] = false;

    if (wasActive) {
      this._onGeneratorDeactivated.dispatch({
        generatorId: id,
        generatorDefinition: this._generators[id],
      });
    }
  }

  /**
   * Check if a generator is currently active
   * @param id The generator ID
   * @returns Whether the generator is active
   */
  public isGeneratorActive(id: string): boolean {
    this.validate(id);
    return this._state.isActive[id];
  }

  public tick(delta: number): void {
    Object.entries(this._state.isActive).forEach(([id, active]) => {
      // Skip inactive generators
      if (!active) return;

      const generator = this._generators[id];
      if (!generator) return;

      // 1. Check conditions
      if (generator.conditions && !this.evaluate(generator.conditions)) {
        this._onGeneratorTickFailed.dispatch({
          generatorId: id,
          reason: 'conditions_not_met',
        });
        return;
      }

      // 2. Consume input (if any)
      let inputConsumed: BaseInput | BaseInput[] | null = null;
      if (generator.input) {
        const scaledInput = this.scaleInput(generator.input, delta);
        if (!this.canConsume(scaledInput)) {
          this._onGeneratorTickFailed.dispatch({
            generatorId: id,
            reason: 'cannot_consume_input',
          });
          return;
        }
        this.consume(scaledInput);
        inputConsumed = scaledInput;
      }

      // 3. Produce output
      const scaledOutput = this.scaleOutput(generator.output, delta);
      if (!this.canProduce(scaledOutput)) {
        this._onGeneratorTickFailed.dispatch({
          generatorId: id,
          reason: 'cannot_produce_output',
        });
        return;
      }
      this.produce(scaledOutput);

      // Emit tick event with actual amounts
      this._onGeneratorTicked.dispatch({
        generatorId: id,
        generatorDefinition: generator,
        delta,
        inputConsumed,
        outputProduced: scaledOutput,
      });
    });
  }

  /**
   * Scale input amounts by delta for time normalization
   * @private
   */
  private scaleInput(input: BaseInput | BaseInput[], delta: number): BaseInput | BaseInput[] {
    const scale = (item: BaseInput): BaseInput => ({
      ...item,
      amount: item.amount * delta,
    });

    if (Array.isArray(input)) {
      return input.map(scale);
    }
    return scale(input);
  }

  /**
   * Scale output amounts by delta for time normalization
   * @private
   */
  private scaleOutput(output: BaseOutput | BaseOutput[], delta: number): BaseOutput | BaseOutput[] {
    const scale = (item: BaseOutput): BaseOutput => ({
      ...item,
      amount: item.amount * delta,
    });

    if (Array.isArray(output)) {
      return output.map(scale);
    }
    return scale(output);
  }

  /**
   * Throws an error if the id does not exist
   * @param id
   * @private
   */
  private validate(id: string): void {
    if (!this.supportsGenerator(id)) {
      throw new UnknownGeneratorError(`Unknown generator with id '${id}'`);
    }
  }

  // Events
  protected _onGeneratorActivated = new SimpleEventDispatcher<GeneratorActivated>();
  protected _onGeneratorDeactivated = new SimpleEventDispatcher<GeneratorDeactivated>();
  protected _onGeneratorTickFailed = new SimpleEventDispatcher<GeneratorTickFailed>();
  protected _onGeneratorTicked = new SimpleEventDispatcher<GeneratorTicked>();

  /**
   * Emitted when a generator is activated
   */
  public get onGeneratorActivated(): ISimpleEvent<GeneratorActivated> {
    return this._onGeneratorActivated.asEvent();
  }

  /**
   * Emitted when a generator is deactivated
   */
  public get onGeneratorDeactivated(): ISimpleEvent<GeneratorDeactivated> {
    return this._onGeneratorDeactivated.asEvent();
  }

  /**
   * Emitted when a generator fails to produce output
   */
  public get onGeneratorTickFailed(): ISimpleEvent<GeneratorTickFailed> {
    return this._onGeneratorTickFailed.asEvent();
  }

  /**
   * Emitted when a generator successfully ticks and produces output
   */
  public get onGeneratorTicked(): ISimpleEvent<GeneratorTicked> {
    return this._onGeneratorTicked.asEvent();
  }
}
