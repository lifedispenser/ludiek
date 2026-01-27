<script lang="ts">
  import {
    GeneratorPlugin,
    createGeneratorState,
    createCurrencyState,
    CurrencyPlugin,
    LudiekEngine,
    GainCurrencyProducer,
    LoseCurrencyConsumer,
  } from '@123ishatest/ludiek';

  import type { GeneratorDetail } from '$lib/demo/model/GeneratorDetail';
  import LudiekProgress from '$lib/components/atoms/LudiekProgress.svelte';

  const generatorState = $state(createGeneratorState());
  const currencyState = $state(createCurrencyState());
  const generator = new GeneratorPlugin(generatorState);
  const currency = new CurrencyPlugin(currencyState);

  const engineState = $state({});
  const engine = new LudiekEngine(
    {
      plugins: [currency, generator],
      producers: [new GainCurrencyProducer()],
      consumers: [new LoseCurrencyConsumer()],
    },
    engineState,
  );

  // Define currencies
  currency.loadContent([{ id: '/currency/seeds' }, { id: '/currency/furniture' }]);

  // Define generators with their output currency
  const generators: GeneratorDetail[] = [
    {
      id: 'seed-producer',
      name: 'Seed Producer',
      description: 'Produces 1 seed per second',
      output: 1,
      outputCurrency: '/currency/seeds',
    },
    {
      id: 'furniture-factory',
      name: 'Furniture Factory',
      description: 'Consumes 5 seeds, produces 2 furniture per second',
      output: 2,
      input: 5,
      outputCurrency: '/currency/furniture',
      inputCurrency: '/currency/seeds',
    },
    {
      id: 'golden-tree',
      name: 'Golden Tree',
      description: 'Produces 3 seeds per second',
      output: 3,
      outputCurrency: '/currency/seeds',
    },
  ];

  generator.loadContent(
    generators.map(
      (g) =>
        ({
          id: g.id,
          output: {
            type: '/output/gain-currency',
            id: g.outputCurrency,
            amount: g.output,
          },
          ...(g.input !== undefined
            ? {
                input: {
                  type: '/input/lose-currency',
                  id: g.inputCurrency,
                  amount: g.input,
                },
              }
            : {}),
        }) as any,
    ),
  );

  let seeds = $derived(currency.getBalance('/currency/seeds'));
  let furniture = $derived(currency.getBalance('/currency/furniture'));
  let seedsNetRate = $derived(
    generators
      .filter((g) => generator.isGeneratorActive(g.id) && g.outputCurrency === '/currency/seeds')
      .reduce((acc, g) => acc + g.output, 0) -
      generators
        .filter((g) => generator.isGeneratorActive(g.id) && g.inputCurrency === '/currency/seeds')
        .reduce((acc, g) => acc + (g.input ?? 0), 0),
  );
  let furnitureNetRate = $derived(
    generators
      .filter((g) => generator.isGeneratorActive(g.id) && g.outputCurrency === '/currency/furniture')
      .reduce((acc, g) => acc + g.output, 0) -
      generators
        .filter((g) => generator.isGeneratorActive(g.id) && g.inputCurrency === '/currency/furniture')
        .reduce((acc, g) => acc + (g.input ?? 0), 0),
  );

  const toggleGenerator = (id: string) => {
    const isActive = generator.isGeneratorActive(id);
    if (isActive) {
      generator.deactivateGenerator(id);
    } else {
      generator.activateGenerator(id);
    }
  };

  setInterval(() => {
    engine.preTick();
    generator.tick(0.1); // Tick every 100ms
  }, 100);

  // Add event listeners for demonstration
  const addEventLog = (message: string, type: 'success' | 'error' | 'info') => {
    const container = document.getElementById('generator-events');
    if (container) {
      const entry = document.createElement('div');
      entry.className = `text-xs py-1 border-b border-base-300 ${type === 'error' ? 'text-error' : type === 'success' ? 'text-success' : 'text-info'}`;
      entry.textContent = message;
      container.insertBefore(entry, container.firstChild);
    }
  };

  generator.onGeneratorActivated.subscribe(({ generatorId, generatorDefinition }) => {
    addEventLog(`${generatorId} started producing!`, 'success');
  });

  generator.onGeneratorDeactivated.subscribe(({ generatorId }) => {
    addEventLog(`${generatorId} stopped producing`, 'info');
  });

  generator.onGeneratorTickFailed.subscribe(({ generatorId, reason }) => {
    let reasonText = '';
    if (reason === 'conditions_not_met') {
      reasonText = 'conditions not met';
    } else if (reason === 'cannot_consume_input') {
      reasonText = 'not enough input resources';
    } else if (reason === 'cannot_produce_output') {
      reasonText = 'cannot produce output';
    }
    addEventLog(`${generatorId} failed to tick: ${reasonText}`, 'error');
  });
</script>

<div class="flex flex-col space-y-4">
  <div class="card card-border bg-base-200 w-96">
    <div class="card-body">
      <span class="card-title">Resources</span>
      <div class="mt-2 flex flex-col space-y-2">
        <div class="flex flex-row items-center justify-between">
          <div class="flex items-center space-x-2">
            <span>You have</span>
            <span class="text-primary text-2xl">{seeds.toFixed(1)}</span>
            <span>seeds</span>
          </div>
          <div class="text-sm">
            <span class={seedsNetRate > 0 ? 'text-success' : 'text-error'}>{seedsNetRate.toFixed(1)}/s</span>
          </div>
        </div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex items-center space-x-2">
            <span>You have</span>
            <span class="text-secondary text-2xl">{furniture.toFixed(1)}</span>
            <span>furniture</span>
          </div>
          <div class="text-sm">
            <span class={furnitureNetRate > 0 ? 'text-success' : 'text-error'}>{furnitureNetRate.toFixed(1)}/s</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card card-border bg-base-200 w-96">
    <div class="card-body">
      <span class="card-title">Generators</span>
      <div class="flex flex-col space-y-2">
        {#each generators as gen (gen.id)}
          {@const isActive = generator.isGeneratorActive(gen.id)}

          <div
            class="flex flex-col items-center justify-between border-2 p-3 {isActive
              ? 'border-primary'
              : 'border-secondary'}"
          >
            <div class="flex w-2/3 flex-col items-center">
              <span class="text-center font-bold">{gen.name}</span>
              <span class="text-center text-sm">{gen.description}</span>
              <div class="flex items-center space-x-1 text-sm">
                <span class="text-success">+{gen.output}/s</span>
                {#if gen.input !== undefined}
                  <span class="text-error">-{gen.input}/s</span>
                {/if}
              </div>
            </div>

            <button class="btn {isActive ? 'btn-error' : 'btn-primary'} w-1/3" onclick={() => toggleGenerator(gen.id)}>
              {isActive ? 'Stop' : 'Start'}
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="card card-border bg-base-200 w-96">
    <div class="card-body">
      <h3 class="text-lg font-bold">Recent Events</h3>
      <div id="generator-events" class="flex max-h-64 flex-col space-y-1 overflow-y-auto text-sm">
        <span class="text-secondary">Interact with generators to see events...</span>
      </div>
    </div>
  </div>
</div>
