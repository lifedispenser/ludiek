import {
  AchievementPlugin,
  CouponPlugin,
  createAchievementState,
  createCouponState,
  createCurrencyState,
  createSkillState,
  createStatisticState,
  createUpgradeState,
  CurrencyPlugin,
  GainCurrencyProducer,
  LoseCurrencyConsumer,
  type LudiekBonusContribution,
  type LudiekCondition,
  LudiekEngine,
  LudiekGame,
  type LudiekInput,
  type LudiekOutput,
  UpgradePlugin,
  StatisticPlugin,
  TrueEvaluator,
  HasCurrencyEvaluator,
  HasScalarStatisticEvaluator,
  SkillPlugin,
  AllEvaluator,
  IsUpgradeMaxedEvaluator,
} from '@123ishatest/ludiek';
import { achievements, currencies, generators, statistics, upgrades } from './cookieClickerContent';
import type { GeneratorDetail } from './model/GeneratorDetail';

// Define plugins with reactive state
const currencyState = $state(createCurrencyState());
const currencyPlugin = new CurrencyPlugin(currencyState);
const statisticState = $state(createStatisticState());
const statisticPlugin = new StatisticPlugin(statisticState);
const achievementState = $state(createAchievementState());
const achievementPlugin = new AchievementPlugin(achievementState);
const couponState = $state(createCouponState());
const couponPlugin = new CouponPlugin(couponState);
const skillState = $state(createSkillState());
const skillPlugin = new SkillPlugin(skillState);
const upgradeState = $state(createUpgradeState());
const upgradePlugin = new UpgradePlugin(upgradeState);

const engineState = $state({});

// Create engine with plugins (no GeneratorPlugin - we'll manage generators manually)
export const engine = new LudiekEngine(
  {
    plugins: [currencyPlugin, statisticPlugin, achievementPlugin, couponPlugin, skillPlugin, upgradePlugin],
    evaluators: [
      new TrueEvaluator(),
      new HasCurrencyEvaluator(),
      new HasScalarStatisticEvaluator(),
      new AllEvaluator(),
      new IsUpgradeMaxedEvaluator(),
    ],
    consumers: [new LoseCurrencyConsumer()],
    producers: [new GainCurrencyProducer()],
    modifiers: [],
  },
  engineState,
);

// Extract some neat utility types
export type EnginePlugins = typeof engine.plugins;
export type Condition = LudiekCondition<typeof engine.evaluators>;
export type Input = LudiekInput<typeof engine.consumers>;
export type Output = LudiekOutput<typeof engine.producers>;
export type Bonus = LudiekBonusContribution<typeof engine.modifiers>;

// Track generator ownership manually
const generatorOwnership = $state<Record<string, number>>({
  '/generator/cursor': 0,
  '/generator/grandma': 0,
  '/generator/farm': 0,
});

// Create game instance
export const game = new LudiekGame(engine, {
  features: [],
  saveKey: '@123ishatest/ludiek-cookie-clicker',
  tickDuration: 0.1,
  saveInterval: 30,
});

// Load content
engine.plugins.currency.loadContent(currencies);
engine.plugins.statistic.loadContent(statistics);
engine.plugins.achievement.loadContent(achievements);
engine.plugins.upgrade.loadContent(upgrades);

// Track statistics when currency is gained
currencyPlugin.onCurrencyGain.sub((currency) => {
  if (currency.id === '/currency/cookies') {
    statisticPlugin.incrementStatistic('/statistic/total-cookies', currency.amount);
    achievementPlugin.checkAchievements();
  }
});

// Handle upgrade bought events to apply bonuses
upgradePlugin.onUpgradeBought.sub((upgrade) => {
  achievementPlugin.checkAchievements();
});

export const { currency, statistic, achievement, skill, upgrade } = engine.plugins;

// Helper function to buy a generator
export const buyGenerator = (generatorId: string) => {
  const gen = generators.find((g) => g.id === generatorId);
  if (!gen || !gen.cost || !gen.costCurrency) return false;

  const currentCount = generatorOwnership[generatorId];
  // Scale cost: base cost * 1.15^count
  const cost = Math.floor(gen.cost * Math.pow(1.15, currentCount));

  const canAfford = currencyPlugin.getBalance(gen.costCurrency) >= cost;
  if (!canAfford) return false;

  // Consume currency
  engine.consume({
    type: '/input/lose-currency',
    id: gen.costCurrency,
    amount: cost,
  });

  // Increment generator count
  generatorOwnership[generatorId] = currentCount + 1;

  // Track total generators
  statisticPlugin.incrementStatistic('/statistic/generators-owned', 1);

  // Check achievements
  achievementPlugin.checkAchievements();

  return true;
};

// Helper function to get generator count
export const getGeneratorCount = (generatorId: string) => {
  return generatorOwnership[generatorId] || 0;
};

// Helper function to get generator cost
export const getGeneratorCost = (generatorId: string) => {
  const gen = generators.find((g) => g.id === generatorId);
  if (!gen || !gen.cost) return 0;

  const currentCount = generatorOwnership[generatorId];
  return Math.floor(gen.cost * Math.pow(1.15, currentCount));
};

// Helper function to get all upgrade bonuses for a type
const getBonusesByType = (bonusType: string) => {
  const bonuses = upgradePlugin.upgradeList
    .filter((u) => u.bonusPerLevel.some((b) => b.type === bonusType))
    .flatMap((u) => {
      const level = upgradePlugin.getLevel(u.id);
      const bonusPerLevel = u.bonusPerLevel.find((b) => b.type === bonusType);
      if (!bonusPerLevel || level === 0) return [];

      if (u.accumulateBonuses) {
        // Sum all bonuses up to current level
        return Array(level).fill(bonusPerLevel.amount);
      } else {
        // Only apply bonus for current level
        return [bonusPerLevel.amount];
      }
    });

  // Sum all bonuses
  return bonuses.reduce((sum, amount) => sum + amount, 0);
};

// Helper function to get generator production rate
export const getGeneratorProductionRate = (generatorId: string) => {
  const gen = generators.find((g) => g.id === generatorId);
  if (!gen) return 0;

  const count = generatorOwnership[generatorId] || 0;
  if (count === 0) return 0;

  let baseProduction = gen.output * count;

  // Apply efficiency bonuses
  if (generatorId === '/generator/cursor') {
    const bonus = getBonusesByType('/bonus/cursor-efficiency');
    baseProduction *= 1 + bonus;
  } else if (generatorId === '/generator/grandma') {
    const bonus = getBonusesByType('/bonus/grandma-efficiency');
    baseProduction *= 1 + bonus;
  } else if (generatorId === '/generator/farm') {
    const bonus = getBonusesByType('/bonus/farm-efficiency');
    baseProduction *= 1 + bonus;
  }

  return baseProduction;
};

// Helper function to get total production rate
export const getTotalProductionRate = () => {
  let total = 0;
  for (const gen of generators) {
    total += getGeneratorProductionRate(gen.id);
  }
  return total;
};

// Helper function to get click power
export const getClickPower = () => {
  let basePower = 1; // Base click power
  const bonus = getBonusesByType('/bonus/click-power');
  basePower += bonus;
  return basePower;
};

// Custom tick function for generators
export const tickGenerators = (delta: number) => {
  for (const gen of generators) {
    const count = generatorOwnership[gen.id] || 0;
    if (count === 0) continue;

    const productionRate = getGeneratorProductionRate(gen.id);
    const production = productionRate * delta;

    if (production > 0 && gen.outputCurrency) {
      engine.produce({
        type: '/output/gain-currency',
        id: gen.outputCurrency,
        amount: production,
      });
    }
  }
};

// Save and load generator ownership
export const saveGeneratorOwnership = () => {
  localStorage.setItem('cookie-clicker-generators', JSON.stringify(generatorOwnership));
};

export const loadGeneratorOwnership = () => {
  const saved = localStorage.getItem('cookie-clicker-generators');
  if (saved) {
    const data = JSON.parse(saved);
    for (const key in data) {
      if (generatorOwnership.hasOwnProperty(key)) {
        generatorOwnership[key] = data[key];
      }
    }
  }
};
