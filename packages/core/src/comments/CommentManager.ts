import type { CommentConfig } from './types';

export class CommentManager {
  private config: CommentConfig;

  constructor(config: CommentConfig) {
    this.config = config;
  }

  mount(el: HTMLElement): void {
    if (typeof window === 'undefined') return;
    switch (this.config.provider) {
      case 'giscus': return this.mountGiscus(el);
      case 'twikoo': return this.mountTwikoo(el);
      case 'waline': return this.mountWaline(el);
      case 'utterances': return this.mountUtterances(el);
      case 'disqus': return this.mountDisqus(el);
    }
  }

  syncTheme(theme: 'light' | 'dark'): void {
    if (this.config.provider === 'giscus') {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
    }
  }

  destroy(): void {
    // Cleanup handled by removing the container element
  }

  private mountGiscus(el: HTMLElement): void {
    const c = this.config.giscus!;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', c.repo);
    script.setAttribute('data-repo-id', c.repoId);
    script.setAttribute('data-category', c.category);
    script.setAttribute('data-category-id', c.categoryId);
    script.setAttribute('data-mapping', c.mapping || 'pathname');
    script.setAttribute('data-lang', c.lang || 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    el.appendChild(script);
  }

  private mountTwikoo(el: HTMLElement): void {
    const c = this.config.twikoo!;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1/dist/twikoo.all.min.js';
    script.onload = () => { (window as any).twikoo?.init({ envId: c.envId, el }); };
    document.head.appendChild(script);
  }

  private mountWaline(el: HTMLElement): void {
    const c = this.config.waline!;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@waline/client@v3/dist/waline.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `import{init}from'https://unpkg.com/@waline/client@v3/dist/waline.js';init({el:'#${el.id}',serverURL:'${c.serverURL}'});`;
    document.body.appendChild(script);
  }

  private mountUtterances(el: HTMLElement): void {
    const c = this.config.utterances!;
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', c.repo);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', c.theme || 'github-light');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    el.appendChild(script);
  }

  private mountDisqus(el: HTMLElement): void {
    const c = this.config.disqus!;
    el.id = 'disqus_thread';
    const script = document.createElement('script');
    script.src = `https://${c.shortname}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', String(Date.now()));
    document.body.appendChild(script);
  }
}
