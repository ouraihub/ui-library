<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CodeCopyManager, type CodeCopyOptions } from '@ouraihub/core';

  let { selector, buttonLabel, copiedLabel, buttonClass }: Partial<CodeCopyOptions> = $props();
  let manager: CodeCopyManager | null = null;

  onMount(() => {
    manager = new CodeCopyManager({ selector, buttonLabel, copiedLabel, buttonClass });
    manager.init();
  });

  onDestroy(() => { manager?.destroy(); });
</script>
