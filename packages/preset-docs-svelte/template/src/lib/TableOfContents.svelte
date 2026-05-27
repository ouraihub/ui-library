<script lang="ts">
  interface TocEntry { id: string; text: string; level: number }

  let { content }: { content: string } = $props();

  let headings = $derived.by(() => {
    if (typeof globalThis.DOMParser === 'undefined') return [];
    const entries: TocEntry[] = [];
    const doc = new DOMParser().parseFromString(content, 'text/html');
    doc.querySelectorAll('h2, h3').forEach((el) => {
      const id = el.getAttribute('id');
      if (!id) return;
      entries.push({ id, text: el.textContent || '', level: parseInt(el.tagName[1]) });
    });
    return entries;
  });

  let activeId = $state('');

  $effect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) activeId = e.target.id; },
      { rootMargin: '-78px 0px -62% 0px', threshold: 0 }
    );
    document.querySelectorAll('h2[id], h3[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

{#if headings.length > 0}
  <nav class="toc" aria-label="Table of contents">
    <div class="toc-header">On This Page</div>
    <ul>
      {#each headings as heading}
        <li class="level-{heading.level}">
          <a href="#{heading.id}" class:active={activeId === heading.id}>{heading.text}</a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc-header { font-weight: 600; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--text-muted); }
  ul { list-style: none; padding: 0; }
  li a { display: block; padding: 0.2rem 0; font-size: 0.8rem; color: var(--text-muted); text-decoration: none; }
  li a:hover, li a.active { color: var(--primary); }
  .level-3 { padding-left: 0.75rem; }
</style>
