<script lang="ts">
  import { getEmbedHtml, type EmbedPlatform } from '@ouraihub/core';

  let { platform, id, user, class: className = '' }: {
    platform: EmbedPlatform;
    id: string;
    user?: string;
    class?: string;
  } = $props();

  const html = $derived(getEmbedHtml(platform, { id, user }));
</script>

<div class={className}>
  {@html html}
</div>
