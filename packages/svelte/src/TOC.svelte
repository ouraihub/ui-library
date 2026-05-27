<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { TOCHighlighter, type TOCOptions } from '@ouraihub/core';

  let { headings = [], class: className = '', activeClass = 'active', contentSelector, headingSelector }: {
    headings: { id: string; text: string; depth: number }[];
    class?: string;
    activeClass?: string;
    contentSelector?: string;
    headingSelector?: string;
  } = $props();

  let toc: TOCHighlighter | null = null;

  onMount(() => {
    toc = new TOCHighlighter({ tocSelector: '.oui-toc', activeClass, contentSelector, headingSelector });
    toc.init();
  });

  onDestroy(() => { toc?.destroy(); });
</script>

<nav class="oui-toc {className}">
  <ul>
    {#each headings as h}
      <li style="padding-left: {(h.depth - 2) * 0.75}rem">
        <a href="#{h.id}">{h.text}</a>
      </li>
    {/each}
  </ul>
</nav>
