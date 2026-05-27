import { Marked, type Tokens } from 'marked';
import { markedHighlight } from 'marked-highlight';
import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/<[^>]*>/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  {
    renderer: {
      heading({ text, depth }: Tokens.Heading): string {
        const id = slugify(text.replace(/<[^>]*>/g, ''));
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
    },
  }
);

export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true }, ADD_ATTR: ['id'] });
}
