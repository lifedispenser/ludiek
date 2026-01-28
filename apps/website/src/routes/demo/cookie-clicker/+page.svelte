<script lang="ts">
  import { onMount } from 'svelte';
  import {
    currency,
    statistic,
    achievement,
    upgrade,
    tickGenerators,
    game,
    buyGenerator,
    getClickPower,
    getTotalProductionRate,
    getGeneratorCost,
    getGeneratorCount,
    getGeneratorProductionRate,
    loadGeneratorOwnership,
    saveGeneratorOwnership,
  } from '$lib/demo/cookieClicker.svelte';
  import { generators, upgrades, achievements } from '$lib/demo/cookieClickerContent';

  interface Notification {
    id: number;
    type: 'alert-success' | 'alert-info';
    message: string;
  }

  let notifications: Notification[] = $state([]);
  let notificationId = 0;

  // Reactive values
  let cookies = $derived(currency.getBalance('/currency/cookies'));
  let totalCookies = $derived(statistic.getScalarValue('/statistic/total-cookies') ?? 0);
  let totalClicks = $derived(statistic.getScalarValue('/statistic/total-clicks') ?? 0);
  let productionRate = $derived(getTotalProductionRate());
  let clickPower = $derived(getClickPower());

  // Cookie click animation state
  let cookieScale = $state(1);
  let clickCount = $state(0);

  // Click cookie
  const clickCookie = () => {
    // Gain cookies
    currency.gainCurrency({
      id: '/currency/cookies',
      amount: clickPower,
    });

    // Track clicks
    statistic.incrementStatistic('/statistic/total-clicks', 1);

    // Animation
    cookieScale = 0.95;
    clickCount++;
    setTimeout(() => {
      cookieScale = 1;
    }, 50);

    // Check achievements
    achievement.checkAchievements();
  };

  // Subscribe to achievements
  achievement.onAchievementEarn.sub((a: any) => {
    const achievementDetail = achievements.find((ach) => ach.id === a.id);
    const name = achievementDetail?.name || a.id;
    const icon = achievementDetail?.icon || '🏆';

    addNotification({
      type: 'alert-success',
      message: `${icon} Achievement Earned: ${name}!`,
    });
  });

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = notificationId++;
    notifications.push({ ...notification, id });
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notifications = notifications.filter((n) => n.id !== id);
    }, 5000);
  };

  // Initialize game
  onMount(() => {
    loadGeneratorOwnership();
    game.loadFromStorage();
    game.start();

    // Game loop for generators
    setInterval(() => {
      game.engine.preTick();
      tickGenerators(0.1);
      saveGeneratorOwnership();
    }, 100);
  });

  // Upgrade categories
  const clickUpgrades = upgrades.filter((u) => u.id.includes('click-power'));
  const cursorUpgrades = upgrades.filter((u) => u.id.includes('cursor-efficiency'));
  const grandmaUpgrades = upgrades.filter((u) => u.id.includes('grandma-efficiency'));
  const farmUpgrades = upgrades.filter((u) => u.id.includes('farm-efficiency'));
</script>

<div class="bg-base-100 min-h-screen">
  <div class="container mx-auto p-4">
    <!-- Header -->
    <div class="mb-6 text-center">
      <h1 class="mb-2 text-4xl font-bold">🍪 Cookie Clicker</h1>
      <div class="flex items-center justify-center gap-2">
        <span class="text-primary text-6xl font-bold">{cookies.toFixed(1)}</span>
        <span class="text-2xl">cookies</span>
      </div>
      <div class="text-base-content/70 mt-2 flex justify-center gap-4 text-sm">
        <span>🖱️ {productionRate.toFixed(2)}/s</span>
        <span>👆 +{clickPower.toFixed(1)} per click</span>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left Panel: Upgrades -->
      <div class="card card-bordered bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">Upgrades</h2>

          <!-- Click Upgrades -->
          <div class="mb-6">
            <h3 class="text-primary mb-2 font-bold">Click Upgrades</h3>
            <div class="flex flex-col gap-2">
              {#each clickUpgrades as upgradeDetail}
                {@const isMax = upgrade.isMaxLevel(upgradeDetail.id)}
                {@const level = upgrade.getLevel(upgradeDetail.id)}
                {@const cost = upgrade.getCost(upgradeDetail.id)}
                {@const canBuy = upgrade.canBuyUpgrade(upgradeDetail.id)}

                <div
                  class="flex flex-col gap-1 rounded-lg border-2 p-3 {isMax
                    ? 'border-secondary bg-secondary/20'
                    : canBuy
                      ? 'border-primary'
                      : 'border-base-300 opacity-50'}"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-bold">{upgradeDetail.name}</span>
                      <span class="text-base-content/70 ml-2 text-sm">{upgradeDetail.description}</span>
                    </div>
                    <span class={isMax ? 'text-secondary' : 'text-primary'}>{isMax ? 'Max' : `Lvl ${level}`}</span>
                  </div>
                  {#if !isMax}
                    <button
                      class="btn btn-sm {canBuy ? 'btn-primary' : 'btn-disabled'}"
                      onclick={() => upgrade.buyUpgrade(upgradeDetail.id)}
                    >
                      Buy for {cost.amount.toFixed(0)} cookies
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- Generator Upgrades -->
          <div class="mb-6">
            <h3 class="text-secondary mb-2 font-bold">Cursor Upgrades</h3>
            <div class="flex flex-col gap-2">
              {#each cursorUpgrades as upgradeDetail}
                {@const isMax = upgrade.isMaxLevel(upgradeDetail.id)}
                {@const level = upgrade.getLevel(upgradeDetail.id)}
                {@const cost = upgrade.getCost(upgradeDetail.id)}
                {@const canBuy = upgrade.canBuyUpgrade(upgradeDetail.id)}

                <div
                  class="flex flex-col gap-1 rounded-lg border-2 p-3 {isMax
                    ? 'border-secondary bg-secondary/20'
                    : canBuy
                      ? 'border-primary'
                      : 'border-base-300 opacity-50'}"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-bold">{upgradeDetail.name}</span>
                      <span class="text-base-content/70 ml-2 text-sm">{upgradeDetail.description}</span>
                    </div>
                    <span class={isMax ? 'text-secondary' : 'text-primary'}>{isMax ? 'Max' : `Lvl ${level}`}</span>
                  </div>
                  {#if !isMax}
                    <button
                      class="btn btn-sm {canBuy ? 'btn-primary' : 'btn-disabled'}"
                      onclick={() => upgrade.buyUpgrade(upgradeDetail.id)}
                    >
                      Buy for {cost.amount.toFixed(0)} cookies
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-accent mb-2 font-bold">Grandma Upgrades</h3>
            <div class="flex flex-col gap-2">
              {#each grandmaUpgrades as upgradeDetail}
                {@const isMax = upgrade.isMaxLevel(upgradeDetail.id)}
                {@const level = upgrade.getLevel(upgradeDetail.id)}
                {@const cost = upgrade.getCost(upgradeDetail.id)}
                {@const canBuy = upgrade.canBuyUpgrade(upgradeDetail.id)}

                <div
                  class="flex flex-col gap-1 rounded-lg border-2 p-3 {isMax
                    ? 'border-secondary bg-secondary/20'
                    : canBuy
                      ? 'border-primary'
                      : 'border-base-300 opacity-50'}"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-bold">{upgradeDetail.name}</span>
                      <span class="text-base-content/70 ml-2 text-sm">{upgradeDetail.description}</span>
                    </div>
                    <span class={isMax ? 'text-secondary' : 'text-primary'}>{isMax ? 'Max' : `Lvl ${level}`}</span>
                  </div>
                  {#if !isMax}
                    <button
                      class="btn btn-sm {canBuy ? 'btn-primary' : 'btn-disabled'}"
                      onclick={() => upgrade.buyUpgrade(upgradeDetail.id)}
                    >
                      Buy for {cost.amount.toFixed(0)} cookies
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <div>
            <h3 class="text-success mb-2 font-bold">Farm Upgrades</h3>
            <div class="flex flex-col gap-2">
              {#each farmUpgrades as upgradeDetail}
                {@const isMax = upgrade.isMaxLevel(upgradeDetail.id)}
                {@const level = upgrade.getLevel(upgradeDetail.id)}
                {@const cost = upgrade.getCost(upgradeDetail.id)}
                {@const canBuy = upgrade.canBuyUpgrade(upgradeDetail.id)}

                <div
                  class="flex flex-col gap-1 rounded-lg border-2 p-3 {isMax
                    ? 'border-secondary bg-secondary/20'
                    : canBuy
                      ? 'border-primary'
                      : 'border-base-300 opacity-50'}"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-bold">{upgradeDetail.name}</span>
                      <span class="text-base-content/70 ml-2 text-sm">{upgradeDetail.description}</span>
                    </div>
                    <span class={isMax ? 'text-secondary' : 'text-primary'}>{isMax ? 'Max' : `Lvl ${level}`}</span>
                  </div>
                  {#if !isMax}
                    <button
                      class="btn btn-sm {canBuy ? 'btn-primary' : 'btn-disabled'}"
                      onclick={() => upgrade.buyUpgrade(upgradeDetail.id)}
                    >
                      Buy for {cost.amount.toFixed(0)} cookies
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Center: Cookie -->
      <div class="flex flex-col items-center justify-center">
        <button
          class="bg-base-200 flex items-center justify-center rounded-full transition-transform"
          style:transform="scale({cookieScale})"
          style:width="300px"
          style:height="300px"
          onclick={() => clickCookie()}
        >
          <span class="text-[180px] select-none">🍪</span>
        </button>

        <!-- Achievements Section -->
        <div class="mt-6 w-full">
          <div class="card card-bordered bg-base-200">
            <div class="card-body">
              <h2 class="card-title mb-4">Achievements</h2>
              <div class="grid grid-cols-3 gap-2">
                {#each achievements as achievementDetail}
                  {@const isEarned = achievement.hasAchievement(achievementDetail.id)}

                  <div
                    class="flex flex-col items-center rounded-lg border-2 p-2 text-center {isEarned
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 opacity-50'}"
                    title={achievementDetail.description}
                  >
                    <span class="text-3xl">{achievementDetail.icon || '🏆'}</span>
                    <span class="mt-1 text-xs font-bold">{achievementDetail.name}</span>
                    <span class="text-xs">
                      {isEarned ? '✓' : '🔒'}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Generators -->
      <div class="card card-bordered bg-base-200">
        <div class="card-body">
          <h2 class="card-title mb-4">Generators</h2>
          <div class="flex flex-col gap-4">
            {#each generators as generator}
              {@const count = getGeneratorCount(generator.id)}
              {@const productionRate = getGeneratorProductionRate(generator.id)}
              {@const cost = getGeneratorCost(generator.id)}
              {@const canAfford = cookies >= cost}

              <div
                class="flex flex-col gap-2 rounded-lg border-2 p-4 {count > 0 ? 'border-primary' : 'border-base-300'}"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-bold">{generator.name}</h3>
                    <p class="text-base-content/70 text-sm">{generator.description}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-primary text-2xl font-bold">{count}</span>
                    <span class="text-base-content/70 text-sm">owned</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm">Production: {productionRate.toFixed(2)} cookies/s</span>
                  <button
                    class="btn btn-sm {canAfford ? 'btn-primary' : 'btn-disabled'}"
                    onclick={() => buyGenerator(generator.id)}
                  >
                    Buy {cost.toFixed(0)} cookies
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="fixed right-4 bottom-4 flex max-w-md flex-col gap-2">
      {#each notifications as notification (notification.id)}
        <div role="alert" class="alert shadow-lg {notification.type}">
          <span>{notification.message}</span>
        </div>
      {/each}
    </div>

    <!-- Stats Footer -->
    <div class="text-base-content/70 mt-6 flex justify-center gap-8 text-center text-sm">
      <div>
        <span class="font-bold">Total Clicks:</span>
        <span class="ml-1">{totalClicks}</span>
      </div>
      <div>
        <span class="font-bold">Total Cookies:</span>
        <span class="ml-1">{totalCookies.toFixed(1)}</span>
      </div>
    </div>
  </div>
</div>
