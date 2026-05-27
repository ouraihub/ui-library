<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ThemeManager } from '@ouraihub/core';

  let { class: className = '' }: { class?: string } = $props();
  let theme = $state<'light' | 'dark'>('light');
  let manager: ThemeManager | null = null;

  onMount(() => {
    manager = new ThemeManager(document.documentElement, { storageKey: 'theme', attribute: 'data-theme' });
    theme = manager.getTheme();
    manager.onThemeChange((t) => { theme = t; });
  });

  function toggle() { manager?.toggle(); }
</script>

<button onclick={toggle} class={className} aria-label="Toggle theme">
  {#if theme === 'dark'}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  {/if}
</button>
