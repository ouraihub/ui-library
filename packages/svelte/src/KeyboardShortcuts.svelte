<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { KeyboardShortcuts, type Shortcut } from '@ouraihub/core';

  let { shortcuts = [] }: { shortcuts: Shortcut[] } = $props();
  let ks: KeyboardShortcuts | null = null;

  onMount(() => {
    ks = new KeyboardShortcuts();
    shortcuts.forEach((s) => ks!.register(s));
  });

  onDestroy(() => { ks?.destroy(); });
</script>
