import type { CurrencyDetail } from '$lib/demo/model/CurrencyDetail';
import type { AchievementDetail } from '$lib/demo/model/AchievementDetail';
import type { StatisticDetail } from '$lib/demo/model/StatisticDetail';
import type { GeneratorDetail } from '$lib/demo/model/GeneratorDetail';
import type { UpgradeDetail } from '$lib/demo/model/UpgradeDetail';

// Currencies
export const currencies: CurrencyDetail[] = [
  { id: '/currency/cookies', name: 'Cookies', icon: '/icons/nugget-yellow.png' },
];

// Statistics
export const statistics: StatisticDetail[] = [
  { id: '/statistic/total-cookies', type: 'scalar', name: 'Total cookies earned' },
  { id: '/statistic/total-clicks', type: 'scalar', name: 'Total clicks' },
  { id: '/statistic/generators-owned', type: 'scalar', name: 'Total generators owned' },
];

// Generators - 3 different types
export const generators: GeneratorDetail[] = [
  {
    id: '/generator/cursor',
    name: 'Cursor',
    description: 'Auto-clicks 0.1 cookies per second',
    output: 0.1,
    outputCurrency: '/currency/cookies',
    cost: 15,
    costCurrency: '/currency/cookies',
  },
  {
    id: '/generator/grandma',
    name: 'Grandma',
    description: 'Bakes 1 cookie per second',
    output: 1,
    outputCurrency: '/currency/cookies',
    cost: 100,
    costCurrency: '/currency/cookies',
  },
  {
    id: '/generator/farm',
    name: 'Farm',
    description: 'Grows 8 cookies per second',
    output: 8,
    outputCurrency: '/currency/cookies',
    cost: 1100,
    costCurrency: '/currency/cookies',
  },
];

// Upgrades
export const upgrades: UpgradeDetail[] = [
  // Click upgrades
  {
    id: '/upgrade/click-power-1',
    name: 'Better Clicking',
    description: '+0.5 cookies per click',
    bonusPerLevel: [{ type: '/bonus/click-power', amount: 0.5 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 100 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/click-power-2',
    name: 'Cookie Clicking Pro',
    description: '+1 cookie per click',
    bonusPerLevel: [{ type: '/bonus/click-power', amount: 1 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 500 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/click-power-3',
    name: 'Cookie Master',
    description: '+2 cookies per click',
    bonusPerLevel: [{ type: '/bonus/click-power', amount: 2 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 2000 } as any],
    accumulateBonuses: true,
  },
  // Cursor upgrades
  {
    id: '/upgrade/cursor-efficiency-1',
    name: 'Cursor Training',
    description: '+10% cursor production',
    bonusPerLevel: [{ type: '/bonus/cursor-efficiency', amount: 0.1 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 200 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/cursor-efficiency-2',
    name: 'Cursor Expert',
    description: '+20% cursor production',
    bonusPerLevel: [{ type: '/bonus/cursor-efficiency', amount: 0.2 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 1000 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/cursor-efficiency-3',
    name: 'Cursor Master',
    description: '+30% cursor production',
    bonusPerLevel: [{ type: '/bonus/cursor-efficiency', amount: 0.3 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 5000 } as any],
    accumulateBonuses: true,
  },
  // Grandma upgrades
  {
    id: '/upgrade/grandma-efficiency-1',
    name: 'Grandma Glasses',
    description: '+10% grandma production',
    bonusPerLevel: [{ type: '/bonus/grandma-efficiency', amount: 0.1 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 1000 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/grandma-efficiency-2',
    name: 'Grandma Apron',
    description: '+20% grandma production',
    bonusPerLevel: [{ type: '/bonus/grandma-efficiency', amount: 0.2 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 5000 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/grandma-efficiency-3',
    name: 'Grandma Legacy',
    description: '+30% grandma production',
    bonusPerLevel: [{ type: '/bonus/grandma-efficiency', amount: 0.3 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 25000 } as any],
    accumulateBonuses: true,
  },
  // Farm upgrades
  {
    id: '/upgrade/farm-efficiency-1',
    name: 'Better Fertilizer',
    description: '+10% farm production',
    bonusPerLevel: [{ type: '/bonus/farm-efficiency', amount: 0.1 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 11000 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/farm-efficiency-2',
    name: 'Automated Watering',
    description: '+20% farm production',
    bonusPerLevel: [{ type: '/bonus/farm-efficiency', amount: 0.2 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 55000 } as any],
    accumulateBonuses: true,
  },
  {
    id: '/upgrade/farm-efficiency-3',
    name: 'Farming Empire',
    description: '+30% farm production',
    bonusPerLevel: [{ type: '/bonus/farm-efficiency', amount: 0.3 }],
    costPerLevel: [{ type: '/input/lose-currency', id: '/currency/cookies', amount: 275000 } as any],
    accumulateBonuses: true,
  },
];

// Achievements
export const achievements: AchievementDetail[] = [
  {
    id: '/achievement/first-cookie',
    name: 'First Cookie',
    icon: '🍪',
    description: 'Click the cookie for the first time',
    condition: {
      type: '/condition/has-scalar-statistic',
      id: '/statistic/total-clicks',
      amount: 1,
    },
  },
  {
    id: '/achievement/100-cookies',
    name: 'Sweet Tooth',
    icon: '🍭',
    description: 'Earn 100 cookies',
    condition: {
      type: '/condition/has-scalar-statistic',
      id: '/statistic/total-cookies',
      amount: 100,
    },
  },
  {
    id: '/achievement/1000-cookies',
    name: 'Cookie Fan',
    icon: '🎂',
    description: 'Earn 1,000 cookies',
    condition: {
      type: '/condition/has-scalar-statistic',
      id: '/statistic/total-cookies',
      amount: 1000,
    },
  },
  {
    id: '/achievement/first-generator',
    name: 'Automation Begins',
    icon: '🤖',
    description: 'Buy your first generator',
    condition: {
      type: '/condition/has-scalar-statistic',
      id: '/statistic/generators-owned',
      amount: 1,
    },
  },
  {
    id: '/achievement/10-generators',
    name: 'Factory Owner',
    icon: '🏭',
    description: 'Own 10 generators total',
    condition: {
      type: '/condition/has-scalar-statistic',
      id: '/statistic/generators-owned',
      amount: 10,
    },
  },
  {
    id: '/achievement/final-finished-demo',
    name: 'Cookie Master',
    icon: '👑',
    description: 'Have all upgrades and at least one of each generator type',
    condition: {
      type: '/condition/all',
      conditions: [
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/click-power-1' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/click-power-2' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/click-power-3' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/cursor-efficiency-1' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/cursor-efficiency-2' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/cursor-efficiency-3' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/grandma-efficiency-1' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/grandma-efficiency-2' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/grandma-efficiency-3' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/farm-efficiency-1' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/farm-efficiency-2' },
        { type: '/condition/is-upgrade-maxed', upgrade: '/upgrade/farm-efficiency-3' },
      ],
    },
  },
];

export const content = {
  getCurrency: (id: string) => currencies.find((c) => c.id === id) as CurrencyDetail,
  getStatistic: (id: string) => statistics.find((s) => s.id === id) as StatisticDetail,
  getGenerator: (id: string) => generators.find((g) => g.id === id) as GeneratorDetail,
  getUpgrade: (id: string) => upgrades.find((u) => u.id === id) as UpgradeDetail,
  getAchievement: (id: string) => achievements.find((a) => a.id === id) as AchievementDetail,
};
