# @ouraihub/preset-docs-svelte

SvelteKit documentation site template powered by `@ouraihub/ui-library`.

## Quick Start

```bash
npx degit ouraihub/ui-library/packages/preset-docs-svelte/template my-docs
cd my-docs
pnpm install
pnpm dev
```

## Features

- Markdown rendering with syntax highlighting
- Sidebar navigation
- Table of contents with active heading tracking
- Search via `@ouraihub/svelte`
- Responsive layout

## Structure

```
src/
├── app.html
├── app.css
├── routes/
│   ├── +layout.svelte
│   └── docs/[...slug]/+page.svelte
└── lib/
    ├── DocsLayout.svelte
    ├── DocSidebar.svelte
    ├── TableOfContents.svelte
    ├── DocSearch.svelte
    └── markdown.ts
```
