<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { TerminalPlayer, type TerminalPlayerOptions } from '@ouraihub/core';

  let { src, cols, rows, autoplay, preload, loop, speed, startAt, idleTimeLimit, poster, fit, theme, title, class: className = '' }: TerminalPlayerOptions & { class?: string } = $props();

  let el: HTMLDivElement;
  let player: TerminalPlayer | null = null;

  onMount(async () => {
    player = new TerminalPlayer({ src, cols, rows, autoplay, preload, loop, speed, startAt, idleTimeLimit, poster, fit, theme, title });
    await player.mount(el);
  });

  onDestroy(() => { player?.destroy(); });
</script>

<div bind:this={el} class={className}></div>
