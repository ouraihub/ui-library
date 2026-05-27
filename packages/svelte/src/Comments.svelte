<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CommentManager, type CommentConfig } from '@ouraihub/core';

  let { config, class: className = '' }: { config: CommentConfig; class?: string } = $props();
  let el: HTMLDivElement;
  let manager: CommentManager | null = null;

  onMount(() => {
    manager = new CommentManager(config);
    manager.mount(el);
  });

  onDestroy(() => { manager?.destroy(); });

  export function syncTheme(theme: 'light' | 'dark') { manager?.syncTheme(theme); }
</script>

<div bind:this={el} class={className} id="comments"></div>
