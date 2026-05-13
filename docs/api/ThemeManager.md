# ThemeManager API

> **包**: `@ouraihub/core`  
> **版本**: 1.4.0  
> **最后更新**: 2026-05-13

主题管理系统，支持 light/dark/system 三态切换，自动持久化用户偏好，监听系统主题变化。

---

## 导入

```typescript
import { ThemeManager } from '@ouraihub/core/theme';
```

---

## 构造函数

```typescript
constructor(element?: HTMLElement, options?: ThemeOptions)
```

创建 ThemeManager 实例。

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `element` | `HTMLElement` | 否 | `document.documentElement` | 应用主题属性的 DOM 元素 |
| `options` | `ThemeOptions` | 否 | `{}` | 配置选项 |

### ThemeOptions

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `storageKey` | `string` | 否 | `'theme'` | localStorage 存储键名 |
| `attribute` | `string` | 否 | `'data-theme'` | HTML 属性名 |
| `defaultTheme` | `ThemeMode` | 否 | `'system'` | 默认主题模式 |

### ThemeMode

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
```

- `'light'`: 浅色主题
- `'dark'`: 深色主题
- `'system'`: 跟随系统设置

### 示例

```typescript
// 使用默认配置
const theme = new ThemeManager();

// 自定义配置
const theme = new ThemeManager(document.body, {
  storageKey: 'my-app-theme',
  attribute: 'data-color-scheme',
  defaultTheme: 'light'
});
```

---

## 方法

### setTheme()

```typescript
setTheme(mode: ThemeMode): void
```

设置主题模式，自动保存到 localStorage 并应用到 DOM。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `mode` | `ThemeMode` | 是 | 要设置的主题模式 |

#### 示例

```typescript
theme.setTheme('dark');   // 切换到深色主题
theme.setTheme('light');  // 切换到浅色主题
theme.setTheme('system'); // 跟随系统设置
```

---

### getTheme()

```typescript
getTheme(): ThemeMode
```

获取当前主题模式（用户设置的模式，可能是 'system'）。

#### 返回值

| 类型 | 描述 |
|------|------|
| `ThemeMode` | 当前主题模式 |

#### 示例

```typescript
const current = theme.getTheme();
console.log(current); // 'light' | 'dark' | 'system'
```

---

### toggle()

```typescript
toggle(): void
```

在 light 和 dark 之间切换（跳过 system 模式）。

#### 示例

```typescript
// 当前是 light，切换后变为 dark
theme.toggle();

// 当前是 dark，切换后变为 light
theme.toggle();

// 当前是 system，解析为实际主题后切换
theme.toggle();
```

---

### onThemeChange()

```typescript
onThemeChange(callback: (theme: ThemeMode) => void): () => void
```

订阅主题变化事件。当主题改变时（包括系统主题变化），回调函数会被调用。

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `callback` | `(theme: ThemeMode) => void` | 是 | 主题变化时的回调函数 |

#### 返回值

| 类型 | 描述 |
|------|------|
| `() => void` | 取消订阅函数 |

#### 示例

```typescript
// 订阅主题变化
const unsubscribe = theme.onThemeChange((mode) => {
  console.log(`主题已切换到: ${mode}`);
  
  // 更新 UI
  updateThemeIcon(mode);
});

// 取消订阅
unsubscribe();
```

---

## 内部机制

### 初始化流程

1. 从 localStorage 读取保存的主题
2. 如果没有保存的主题，使用 `defaultTheme`
3. 应用主题到 DOM 元素
4. 监听系统主题变化（如果当前是 system 模式）

### 主题解析

当主题模式为 `'system'` 时，ThemeManager 会：

1. 使用 `window.matchMedia('(prefers-color-scheme: dark)')` 检测系统偏好
2. 如果系统偏好是深色，解析为 `'dark'`
3. 否则解析为 `'light'`
4. 监听系统偏好变化，自动更新主题

### 持久化

主题设置会自动保存到 localStorage：

```javascript
localStorage.setItem('theme', 'dark'); // 默认键名
```

如果 localStorage 不可用（如隐私模式），会在控制台输出警告，但不影响功能。

---

## 完整示例

### 基础用法

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

// 创建实例
const theme = new ThemeManager();

// 获取切换按钮
const toggleBtn = document.querySelector('[data-theme-toggle]');

// 点击切换主题
toggleBtn?.addEventListener('click', () => {
  theme.toggle();
});

// 订阅变化，更新按钮图标
theme.onThemeChange((mode) => {
  const icon = mode === 'dark' ? '🌙' : '☀️';
  if (toggleBtn) {
    toggleBtn.textContent = icon;
  }
});
```

### 高级用法：三态切换

```typescript
import { ThemeManager } from '@ouraihub/core/theme';

const theme = new ThemeManager();
const themeSelect = document.querySelector('select[name="theme"]');

// 初始化选择器
if (themeSelect) {
  themeSelect.value = theme.getTheme();
}

// 监听选择器变化
themeSelect?.addEventListener('change', (e) => {
  const mode = (e.target as HTMLSelectElement).value as ThemeMode;
  theme.setTheme(mode);
});

// 订阅主题变化，同步 UI
theme.onThemeChange((mode) => {
  // 更新选择器
  if (themeSelect) {
    themeSelect.value = mode;
  }
  
  // 更新其他 UI 元素
  document.querySelectorAll('[data-theme-indicator]').forEach(el => {
    el.textContent = mode;
  });
});
```

### 防闪烁脚本

在 HTML `<head>` 中添加内联脚本，防止页面加载时的主题闪烁：

```html
<script>
(function(){
  try{
    var key='theme';
    var attr='data-theme';
    var t=localStorage.getItem(key)||'system';
    if(t==='system'){
      t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    }
    document.documentElement.setAttribute(attr,t);
  }catch(e){}
})();
</script>
```

或使用导出的脚本：

```typescript
import { antiFlickerScript } from '@ouraihub/core/theme';

// 在服务端渲染时注入
const html = `
<!DOCTYPE html>
<html>
<head>
  <script>${antiFlickerScript}</script>
</head>
<body>...</body>
</html>
`;
```

---

## CSS 集成

### 使用 CSS 变量

```css
/* 定义主题变量 */
:root[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #000000;
}

:root[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}

/* 使用变量 */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### 使用 Tailwind CSS

```css
/* tailwind.config.js */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  // ...
};
```

```html
<!-- HTML -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-black dark:text-white">自动切换颜色</p>
</div>
```

---

## 注意事项

### 浏览器兼容性

- **localStorage**: IE 8+，所有现代浏览器
- **matchMedia**: IE 10+，所有现代浏览器
- **prefers-color-scheme**: Chrome 76+, Firefox 67+, Safari 12.1+

对于不支持的浏览器，ThemeManager 会优雅降级：

- 如果 localStorage 不可用，主题不会持久化，但功能正常
- 如果 matchMedia 不可用，system 模式会回退到 light

### 性能考虑

- ThemeManager 使用事件监听器模式，避免轮询
- 主题切换是同步操作，不会阻塞 UI
- localStorage 操作被 try-catch 包裹，失败不影响功能

### 最佳实践

1. **尽早初始化**: 在页面加载早期创建 ThemeManager 实例
2. **使用防闪烁脚本**: 在 `<head>` 中添加内联脚本
3. **单例模式**: 整个应用只创建一个 ThemeManager 实例
4. **清理订阅**: 组件卸载时调用返回的取消订阅函数

```typescript
// ✅ 好的做法
const theme = new ThemeManager();
const unsubscribe = theme.onThemeChange(callback);

// 组件卸载时
unsubscribe();

// ❌ 不好的做法
// 多次创建实例
const theme1 = new ThemeManager();
const theme2 = new ThemeManager(); // 不必要

// 忘记取消订阅
theme.onThemeChange(callback); // 可能导致内存泄漏
```

---

## 相关文档

- [API 参考索引](./README.md)
- [类型定义](./types.md)
- [完整设计方案](../DESIGN.md)
- [快速开始](../implementation/02-quick-start.md)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
