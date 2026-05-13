import { describe, expect, it } from 'vitest';
import {
  docsPreset,
  docsTokens,
  docsComponents,
  docsLayout,
  apiReferenceLayout,
  searchLayout,
  fullWidthLayout,
} from '../src/index';

describe('@ouraihub/preset-docs', () => {
  it('exports a coherent docs preset', () => {
    expect(docsPreset.options).toMatchObject({
      name: 'docs',
      version: '0.1.0',
      isDefault: false,
    });
    expect(docsPreset.tokens).toBe(docsTokens);
    expect(docsPreset.components).toBe(docsComponents);
    expect(docsPreset.layout).toBe(docsLayout);
  });

  it('exposes the documented layouts', () => {
    expect(apiReferenceLayout.areas?.content?.maxWidth).toBe('60rem');
    expect(searchLayout.type).toBe('stack');
    expect(fullWidthLayout.maxWidth).toBe('100%');
  });

  it('contains the expected component presets', () => {
    expect(docsComponents.map((component) => component.name)).toEqual([
      'Sidebar',
      'TableOfContents',
      'CodeBlock',
      'Callout',
      'Breadcrumb',
      'SearchModal',
      'ApiReference',
      'Pagination',
    ]);
  });
});
