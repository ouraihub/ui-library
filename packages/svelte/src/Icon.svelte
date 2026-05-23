<script lang="ts">
  import { ICONS, type IconName } from '@ouraihub/icons';

  let { name, size = 24, class: className = '' }: { name: IconName; size?: number; class?: string } = $props();

  const paths = $derived(ICONS[name]?.split('|') || []);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  {#each paths as d}
    <path {d} />
  {/each}
</svg>
