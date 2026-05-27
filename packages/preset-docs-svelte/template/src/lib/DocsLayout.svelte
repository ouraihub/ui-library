<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { NavItem } from './types';
  import DocSidebar from './DocSidebar.svelte';
  import TableOfContents from './TableOfContents.svelte';

  let { nav = [], currentSlug = '', content = '', children }: {
    nav: NavItem[];
    currentSlug?: string;
    content?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="docs-layout">
  <DocSidebar items={nav} {currentSlug} />
  <main class="docs-content">
    {#if children}
      {@render children()}
    {:else}
      <article class="prose">
        {@html content}
      </article>
    {/if}
  </main>
  {#if content}
    <aside class="docs-toc">
      <TableOfContents {content} />
    </aside>
  {/if}
</div>

<style>
  .docs-layout { display: flex; min-height: 100vh; }
  .docs-content { flex: 1; margin-left: 240px; margin-right: 200px; padding: 2rem 3rem; max-width: 800px; }
  .docs-toc { width: 200px; position: fixed; top: 0; right: 0; bottom: 0; overflow-y: auto; padding: 1.5rem 1rem; }
  .prose :global(h2) { margin-top: 2rem; font-size: 1.5rem; }
  .prose :global(h3) { margin-top: 1.5rem; font-size: 1.2rem; }
  .prose :global(p) { line-height: 1.7; margin: 1rem 0; }
  .prose :global(pre) { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; }

  @media (max-width: 1024px) { .docs-toc { display: none; } .docs-content { margin-right: 0; } }
  @media (max-width: 768px) { .docs-content { margin-left: 0; padding: 1.5rem; } }
</style>
