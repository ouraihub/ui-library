<script lang="ts">
  import { onMount } from 'svelte';
  import { SearchAdapter, type SearchOptions, type SearchAdapterResult } from '@ouraihub/core';

  let {
    provider = 'pagefind' as SearchOptions['provider'],
    placeholder = 'Search docs...',
    class: className = '',
  }: {
    provider?: SearchOptions['provider'];
    placeholder?: string;
    class?: string;
  } = $props();

  let query = $state('');
  let results = $state<SearchAdapterResult[]>([]);
  let adapter: SearchAdapter | null = null;

  onMount(async () => {
    adapter = new SearchAdapter({ provider });
    await adapter.init();
  });

  async function handleInput() {
    if (!adapter || !query.trim()) { results = []; return; }
    results = await adapter.search(query);
  }
</script>

<div class={`doc-search ${className}`}>
  <input type="search" bind:value={query} oninput={handleInput} {placeholder} aria-label={placeholder} />
  {#if results.length > 0}
    <ul class="search-results" role="listbox" aria-label="Search results">
      {#each results as r}
        <li role="option"><a href={r.url}><strong>{r.title}</strong><span>{@html r.excerpt}</span></a></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .doc-search { position: relative; }
  input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.875rem; }
  .search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; margin-top: 4px; list-style: none; padding: 0.5rem; max-height: 300px; overflow-y: auto; z-index: 10; }
  .search-results li a { display: block; padding: 0.5rem; border-radius: 4px; text-decoration: none; color: var(--text); }
  .search-results li a:hover { background: var(--surface); }
</style>
