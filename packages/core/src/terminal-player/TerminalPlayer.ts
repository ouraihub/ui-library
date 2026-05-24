import type { TerminalPlayerOptions } from './types';

const DEFAULT_CDN = 'https://cdn.jsdelivr.net/npm/asciinema-player@3/dist';
let loaded = false;

export class TerminalPlayer {
  private opts: TerminalPlayerOptions;
  private player: any = null;

  constructor(options: TerminalPlayerOptions) {
    this.opts = options;
  }

  async mount(el: HTMLElement): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.loadAssets();

    const AsciinemaPlayer = (window as any).AsciinemaPlayer;
    if (!AsciinemaPlayer) return;

    this.player = AsciinemaPlayer.create(this.opts.src, el, {
      cols: this.opts.cols || 80,
      rows: this.opts.rows || 24,
      autoPlay: this.opts.autoplay || false,
      preload: this.opts.preload || false,
      loop: this.opts.loop || false,
      speed: this.opts.speed || 1,
      startAt: this.opts.startAt || 0,
      idleTimeLimit: this.opts.idleTimeLimit,
      poster: this.opts.poster,
      fit: this.opts.fit || 'width',
      theme: this.opts.theme,
      title: this.opts.title,
    });
  }

  destroy(): void {
    if (this.player?.dispose) this.player.dispose();
    this.player = null;
  }

  private async loadAssets(): Promise<void> {
    if (loaded) return;
    const base = this.opts.cdnBase || DEFAULT_CDN;

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base}/bundle/asciinema-player.css`;
    document.head.appendChild(link);

    // Load JS
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${base}/bundle/asciinema-player.min.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load asciinema-player'));
      document.head.appendChild(script);
    });

    loaded = true;
  }
}
