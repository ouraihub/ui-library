<script lang="ts">
  import type { NavItem } from '$lib/types';
  import DocsLayout from '$lib/DocsLayout.svelte';

  const nav: NavItem[] = [
    { title: 'Getting Started', slug: 'getting-started' },
    { title: 'Installation', slug: 'installation' },
    { title: 'Configuration', slug: 'configuration' },
  ];
</script>

<DocsLayout {nav} currentSlug="getting-started">
  <h1>Welcome to the Docs</h1>
  <p>Get started by editing this page.</p>
</DocsLayout>
