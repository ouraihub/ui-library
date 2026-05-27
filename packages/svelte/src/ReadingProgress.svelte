<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ReadingProgress } from '@ouraihub/core';

  let { class: className = '' }: { class?: string } = $props();
  let percent = $state(0);
  let rp: ReadingProgress | null = null;

  onMount(() => {
    rp = new ReadingProgress({ onProgress: (p) => { percent = p; } });
    rp.init();
  });

  onDestroy(() => { rp?.destroy(); });
</script>

<div class={className} style="width: {percent * 100}%" aria-hidden="true"></div>
