<script lang="ts">
  import { onMount } from 'svelte';
  import { SearchAdapter, type SearchOptions, type SearchAdapterResult } from '@ouraihub/core';

  let { provider = 'pagefind', placeholder = 'Search...', searchFn, class: className = '' }: {
    provider?: SearchOptions['provider'];
    placeholder?: string;
    searchFn?: SearchOptions['searchFn'];
    class?: string;
  } = $props();

  let query = $state('');
  let results = $state<SearchAdapterResult[]>([]);
  let adapter: SearchAdapter | null = null;

  onMount(async () => {
    adapter = new SearchAdapter({ provider, searchFn });
    await adapter.init();
  });

  async function handleInput() {
    if (!adapter || !query.trim()) { results = []; return; }
    results = await adapter.search(query);
  }
</script>

<div class={className}>
  <input type="text" bind:value={query} oninput={handleInput} {placeholder} />
  {#if results.length > 0}
    <ul>
      {#each results as r}
        <li><a href={r.url}><strong>{r.title}</strong><span>{@html r.excerpt}</span></a></li>
      {/each}
    </ul>
  {/if}
</div>
