<script lang="ts">
  const demos = [
    {
      name: 'Farming Demo',
      description: 'A simple farming game with currency, statistics, and achievements.',
      path: '/demo/farming',
    },
    {
      name: 'Cookie Clicker',
      description: 'A classic incremental game with generators, upgrades, and achievements.',
      path: '/demo/cookie-clicker',
    },
  ];
</script>

<div class="p-4">
  <h1 class="mb-6 text-3xl font-bold">Demos</h1>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each demos as demo}
      <a
        href={demo.path}
        class="card card-border bg-base-200 hover:bg-base-300 transition-colors"
      >
        <div class="card-body">
          <h2 class="card-title">{demo.name}</h2>
          <p class="text-sm text-base-content/70">{demo.description}</p>
        </div>
      </a>
    {/each}
  </div>
</div>
