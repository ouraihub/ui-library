<script lang="ts">
  import { getShareLinks, type SharePlatform } from '@ouraihub/core';

  let { url, title, platforms, class: className = '' }: {
    url: string;
    title: string;
    platforms?: SharePlatform[];
    class?: string;
  } = $props();

  const links = $derived(getShareLinks(url, title, platforms));
</script>

<div class={className}>
  {#each links as link}
    <a href={link.href} target="_blank" rel="noopener noreferrer" title={link.name}>
      <slot name="icon" {link}>{link.name}</slot>
    </a>
  {/each}
</div>
