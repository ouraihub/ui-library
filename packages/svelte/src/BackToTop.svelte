<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { BackToTop } from '@ouraihub/core';

  let { threshold = 0.3, class: className = '' }: { threshold?: number; class?: string } = $props();
  let visible = $state(false);
  let btt: BackToTop | null = null;

  onMount(() => {
    btt = new BackToTop({
      threshold,
      onShow: () => { visible = true; },
      onHide: () => { visible = false; },
    });
    btt.init();
  });

  onDestroy(() => { btt?.destroy(); });

  function scrollTop() { btt?.scrollToTop(); }
</script>

{#if visible}
  <button onclick={scrollTop} class={className} aria-label="Back to top">
    <slot>↑</slot>
  </button>
{/if}
