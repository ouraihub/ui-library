<script lang="ts">
  import type { NavItem } from './types';

  let { items = [], currentSlug = '' }: { items: NavItem[]; currentSlug?: string } = $props();
</script>

<aside class="doc-sidebar">
  <nav aria-label="Documentation">
    {#each items as item}
      <div class="nav-group">
        <a href="/docs/{item.slug}" class="nav-item" class:active={currentSlug === item.slug}>{item.title}</a>
        {#if item.children}
          <div class="nav-children">
            {#each item.children as child}
              <a href="/docs/{child.slug}" class="nav-item nav-child" class:active={currentSlug === child.slug}>{child.title}</a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>
</aside>

<style>
  .doc-sidebar { width: 240px; position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; padding: 1.5rem 1rem; border-right: 1px solid var(--border, #e2e8f0); }
  .nav-item { display: block; padding: 0.4rem 0.75rem; color: var(--text-muted, #64748b); text-decoration: none; font-size: 0.875rem; border-radius: 6px; }
  .nav-item:hover { color: var(--text, #1e293b); background: var(--surface, #f1f5f9); }
  .nav-item.active { color: var(--primary, #3b82f6); background: var(--primary-light, #eff6ff); font-weight: 500; }
  .nav-children { margin-left: 0.75rem; }
  .nav-child { font-size: 0.8rem; }
</style>
