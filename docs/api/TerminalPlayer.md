# TerminalPlayer

终端录制回放组件，基于 [asciinema-player](https://github.com/asciinema/asciinema-player)。用于在博客/文档中演示 CLI 操作、AI Agent 交互过程。

## 安装

```bash
pnpm add @ouraihub/core @ouraihub/svelte
```

## 使用

### Svelte

```svelte
<script>
  import { TerminalPlayer } from '@ouraihub/svelte';
</script>

<TerminalPlayer
  src="https://asciinema.org/a/335480.cast"
  cols={120}
  rows={35}
  poster="npt:1:58"
/>
```

### 直接使用 Core（任何框架）

```typescript
import { TerminalPlayer } from '@ouraihub/core';

const player = new TerminalPlayer({
  src: '/casts/demo.cast',
  cols: 120,
  rows: 35,
  speed: 1.5,
  theme: 'monokai',
});

// 挂载到 DOM 元素
await player.mount(document.getElementById('terminal')!);

// 销毁
player.destroy();
```

### Hugo Shortcode（参考实现）

```html
<!-- layouts/shortcodes/terminal-player.html -->
<div id="tp-{{ .Ordinal }}"></div>
<script type="module">
  import { TerminalPlayer } from '/js/ouraihub-core.js';
  const player = new TerminalPlayer({
    src: '{{ .Get "src" }}',
    cols: {{ .Get "cols" | default 80 }},
    rows: {{ .Get "rows" | default 24 }},
    poster: '{{ .Get "poster" }}',
    theme: '{{ .Get "theme" | default "asciinema" }}',
  });
  player.mount(document.getElementById('tp-{{ .Ordinal }}'));
</script>
```

使用：
```markdown
{{</* terminal-player src="/casts/ai-demo.cast" cols="120" rows="35" poster="npt:0:30" */>}}
```

## Props / Options

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | **必填**。cast 文件 URL |
| `cols` | `number` | `80` | 终端列数 |
| `rows` | `number` | `24` | 终端行数 |
| `autoplay` | `boolean` | `false` | 自动播放 |
| `preload` | `boolean` | `false` | 预加载 |
| `loop` | `boolean` | `false` | 循环播放 |
| `speed` | `number` | `1` | 播放速度（2 = 两倍速） |
| `startAt` | `number` | `0` | 起始时间（秒） |
| `idleTimeLimit` | `number` | — | 最大空闲时间（秒），超过则快进 |
| `poster` | `string` | — | 封面。`npt:1:23` = 1分23秒截图 |
| `fit` | `string` | `'width'` | 适配模式：`width` / `height` / `both` / `none` |
| `theme` | `string` | — | 主题：`asciinema` / `monokai` / `tango` / `solarized-dark` / `solarized-light` |
| `title` | `string` | — | 播放器标题 |
| `cdnBase` | `string` | jsdelivr | 自定义 CDN 地址 |

## 录制 cast 文件

```bash
# 安装 asciinema
brew install asciinema  # macOS
sudo apt install asciinema  # Ubuntu

# 录制
asciinema rec demo.cast

# 录制（限制空闲时间 2 秒）
asciinema rec -i 2 demo.cast

# 播放预览
asciinema play demo.cast
```

录制完成后将 `.cast` 文件放到站点的 `static/casts/` 目录，或上传到 asciinema.org 获取 URL。

## 典型场景

### AI Agent 操作演示

```svelte
<h3>看 AI Agent 如何自动修复 Bug</h3>
<TerminalPlayer
  src="/casts/agent-fix-bug.cast"
  cols={120}
  rows={35}
  speed={1.5}
  idleTimeLimit={2}
  poster="npt:0:05"
  theme="monokai"
/>
```

### CLI 工具安装教程

```svelte
<TerminalPlayer
  src="/casts/install-guide.cast"
  cols={100}
  rows={24}
  poster="npt:0:01"
/>
```

## 注意事项

- 首次使用时会从 CDN 动态加载 asciinema-player 的 JS（~200KB）和 CSS
- 加载完成后缓存在页面中，后续实例不会重复加载
- SSR 安全：服务端渲染时不会执行 DOM 操作
- 如需自托管，设置 `cdnBase` 指向你的资源路径
