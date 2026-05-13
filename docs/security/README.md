# 安全性指南

> **版本**: 1.0.0  
> **最后更新**: 2026-05-12  
> **状态**: approved  
> **维护者**: Sisyphus (AI Agent)

## 概述

本文档定义了 @ouraihub/ui-library 的安全策略和最佳实践，确保组件库不会引入安全漏洞，保护用户站点的安全。

**安全原则**: 安全是不可妥协的。所有组件必须遵循本文档定义的安全标准。

---

## 目录

- [输入验证](#输入验证)
- [XSS 防护](#xss-防护)
- [CSS 注入防护](#css-注入防护)
- [依赖安全](#依赖安全)
- [安全响应流程](#安全响应流程)
- [安全检查清单](#安全检查清单)

---

## 输入验证

### 原则

**所有用户输入必须验证**。使用白名单而非黑名单，进行类型检查和边界验证。

### 配置参数验证

```typescript
export interface ThemeOptions {
  storageKey?: string;
  attribute?: string;
  defaultTheme?: ThemeMode;
}

export class ThemeManager {
  constructor(element?: HTMLElement, options?: ThemeOptions) {
    // 验证所有配置参数
    this.validateOptions(options);
    this.options = { ...this.getDefaultOptions(), ...options };
    this.init();
  }
  
  private validateOptions(options?: ThemeOptions): void {
    if (!options) return;
    
    // 验证 storageKey
    if (options.storageKey !== undefined) {
      if (typeof options.storageKey !== 'string') {
        throw new TypeError('[Security] storageKey must be a string');
      }
      if (options.storageKey.length === 0) {
        throw new TypeError('[Security] storageKey cannot be empty');
      }
      // 只允许安全的字符
      if (!/^[a-zA-Z0-9_-]+$/.test(options.storageKey)) {
        throw new TypeError('[Security] storageKey contains invalid characters');
      }
    }
    
    // 验证 attribute
    if (options.attribute !== undefined) {
      if (typeof options.attribute !== 'string') {
        throw new TypeError('[Security] attribute must be a string');
      }
      // 只允许 data-* 属性
      if (!options.attribute.startsWith('data-')) {
        throw new TypeError('[Security] attribute must start with "data-"');
      }
      if (!/^data-[a-z][a-z0-9-]*$/.test(options.attribute)) {
        throw new TypeError('[Security] attribute contains invalid characters');
      }
    }
    
    // 验证 defaultTheme（枚举验证）
    if (options.defaultTheme !== undefined) {
      const validThemes: ThemeMode[] = ['light', 'dark', 'system'];
      if (!validThemes.includes(options.defaultTheme)) {
        throw new TypeError(
          `[Security] Invalid defaultTheme: "${options.defaultTheme}". ` +
          `Expected one of: ${validThemes.join(', ')}`
        );
      }
    }
  }
}
```

### URL 验证

```typescript
/**
 * 验证 URL 是否安全
 * 防止 javascript:、data:、vbscript: 等危险协议
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // 只允许安全的协议
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!safeProtocols.includes(parsed.protocol)) {
      console.warn(`[Security] Unsafe URL protocol: ${parsed.protocol}`);
      return false;
    }
    
    return true;
  } catch {
    console.warn(`[Security] Invalid URL: ${url}`);
    return false;
  }
}

// 使用示例
export class NavigationController {
  navigate(url: string): void {
    if (!validateUrl(url)) {
      throw new Error('[Security] Invalid or unsafe URL');
    }
    window.location.href = url;
  }
}
```

### 字符串清理

```typescript
/**
 * 清理用户输入，移除危险字符
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new TypeError('[Security] Input must be a string');
  }
  
  // 限制长度（防止 DoS）
  if (input.length > maxLength) {
    console.warn(`[Security] Input truncated from ${input.length} to ${maxLength} characters`);
    input = input.substring(0, maxLength);
  }
  
  // 移除控制字符
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}
```

---

## XSS 防护

### 原则

**永远不要直接插入未清理的用户输入到 DOM 中**。

### DOM 操作安全

```typescript
// ❌ 危险：使用 innerHTML
element.innerHTML = userInput; // XSS 漏洞！

// ✅ 安全：使用 textContent
element.textContent = userInput;

// ✅ 安全：使用 DOMPurify（如果必须插入 HTML）
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 实际示例

```typescript
export class SearchModal {
  private displayResults(results: SearchResult[]): void {
    const container = this.element.querySelector('.search-results');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      
      // ✅ 安全：使用 textContent
      const title = document.createElement('h3');
      title.textContent = result.title; // 自动转义
      
      const description = document.createElement('p');
      description.textContent = result.description; // 自动转义
      
      item.appendChild(title);
      item.appendChild(description);
      container.appendChild(item);
    });
  }
}
```

### 属性设置安全

```typescript
// ❌ 危险：直接设置 href
link.href = userInput; // 可能是 javascript: 协议

// ✅ 安全：验证后设置
export function setSafeHref(element: HTMLAnchorElement, url: string): void {
  if (!validateUrl(url)) {
    throw new Error('[Security] Invalid URL');
  }
  element.href = url;
}

// ❌ 危险：直接设置 onclick
element.setAttribute('onclick', userInput); // XSS 漏洞！

// ✅ 安全：使用 addEventListener
element.addEventListener('click', () => {
  // 安全的事件处理
});
```

### HTML 清理（当必须使用 innerHTML 时）

```typescript
import DOMPurify from 'dompurify';

/**
 * 安全地设置 HTML 内容
 */
export function setSafeHTML(element: HTMLElement, html: string): void {
  // 配置 DOMPurify
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
  
  element.innerHTML = clean;
}

// 使用示例
export class ContentRenderer {
  render(content: string): void {
    const container = this.element.querySelector('.content');
    if (container) {
      setSafeHTML(container, content);
    }
  }
}
```

---

## CSS 注入防护

### CSS 变量注入防护

```typescript
/**
 * 验证 CSS 变量值是否安全
 */
export function validateCSSValue(value: string): boolean {
  // 只允许安全的 CSS 值
  // 允许：颜色、尺寸、数字
  // 禁止：url()、expression()、javascript:
  
  const dangerousPatterns = [
    /url\s*\(/i,
    /expression\s*\(/i,
    /javascript:/i,
    /@import/i,
    /behavior:/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(value)) {
      console.warn(`[Security] Dangerous CSS pattern detected: ${value}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 安全地设置 CSS 变量
 */
export function setSafeCSSVariable(name: string, value: string): void {
  // 验证变量名
  if (!name.startsWith('--')) {
    throw new Error('[Security] CSS variable name must start with "--"');
  }
  
  if (!/^--[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error('[Security] Invalid CSS variable name');
  }
  
  // 验证变量值
  if (!validateCSSValue(value)) {
    throw new Error('[Security] Invalid CSS value');
  }
  
  // 安全地设置
  document.documentElement.style.setProperty(name, value);
}

// 使用示例
export class ThemeManager {
  setCustomColor(color: string): void {
    // 验证颜色值
    if (!/^#[0-9a-f]{6}$/i.test(color) && !/^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(color)) {
      throw new Error('[Security] Invalid color format');
    }
    
    setSafeCSSVariable('--ui-primary', color);
  }
}
```

### 样式注入防护

```typescript
// ❌ 危险：直接设置 style 属性
element.setAttribute('style', userInput); // CSS 注入漏洞！

// ✅ 安全：使用 style 对象
element.style.color = sanitizedColor;
element.style.backgroundColor = sanitizedBgColor;

// ✅ 安全：使用 CSS 类
element.classList.add('safe-class-name');
```

---

## 依赖安全

### 依赖审计流程

```bash
# 1. 每周运行依赖审计
pnpm audit

# 2. 自动修复低风险漏洞
pnpm audit --fix

# 3. 检查过时的依赖
pnpm outdated

# 4. 更新依赖（谨慎）
pnpm update
```

### 使用 Snyk 进行持续监控

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    # 每天运行一次
    - cron: '0 0 * * *'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run npm audit
        run: pnpm audit --audit-level=high
```

### 依赖锁定

```json
// package.json
{
  "dependencies": {
    // ✅ 好：锁定主版本
    "dompurify": "^3.0.0",
    
    // ❌ 坏：使用 latest
    "some-package": "latest"
  }
}
```

### 依赖选择原则

1. **优先选择知名、活跃维护的包**
2. **检查包的下载量和 GitHub stars**
3. **查看最近的更新时间**
4. **检查是否有已知的安全漏洞**
5. **避免使用过多的依赖**

```bash
# 检查包的信息
npm info dompurify

# 检查包的安全历史
npm audit dompurify
```

---

## 安全响应流程

### 漏洞报告

**报告邮箱**: security@ouraihub.com

**请勿公开披露**：在我们修复漏洞之前，请不要公开披露安全问题。

### 报告应包含

1. **漏洞描述** - 详细说明漏洞的性质
2. **影响范围** - 哪些版本受影响
3. **复现步骤** - 如何触发漏洞
4. **概念验证** - 演示漏洞的代码（如果可能）
5. **建议修复** - 您的修复建议（可选）

### 响应时间承诺

| 严重程度 | 确认时间 | 修复时间 | 披露时间 |
|---------|---------|---------|---------|
| Critical | 24小时 | 7天 | 修复后30天 |
| High | 48小时 | 14天 | 修复后30天 |
| Medium | 7天 | 30天 | 修复后60天 |
| Low | 14天 | 90天 | 修复后90天 |

### 修复流程

1. **确认漏洞** - 验证漏洞是否真实存在
2. **评估影响** - 确定严重程度和影响范围
3. **开发修复** - 创建安全补丁
4. **测试验证** - 确保修复有效且不引入新问题
5. **发布更新** - 发布包含修复的新版本
6. **通知用户** - 通过 GitHub Security Advisory 通知
7. **公开披露** - 在约定时间后公开漏洞详情

---

## 安全检查清单

### 代码审查清单

在提交代码前，检查以下项目：

#### 输入验证
- [ ] 所有用户输入都经过验证
- [ ] 使用白名单而非黑名单
- [ ] 进行类型检查和边界验证
- [ ] 限制输入长度（防止 DoS）

#### XSS 防护
- [ ] 不使用 `innerHTML` 插入用户输入
- [ ] 使用 `textContent` 或 `DOMPurify`
- [ ] 不使用 `eval()` 或 `Function()` 构造器
- [ ] 不在属性中插入未验证的 URL

#### CSS 安全
- [ ] 验证 CSS 变量值
- [ ] 不允许 `url()`、`expression()` 等危险函数
- [ ] 使用 CSS 类而非内联样式

#### 依赖安全
- [ ] 运行 `pnpm audit` 无高危漏洞
- [ ] 所有依赖都是必需的
- [ ] 依赖版本已锁定
- [ ] 检查依赖的维护状态

#### 错误处理
- [ ] 错误消息不泄露敏感信息
- [ ] 有适当的错误边界
- [ ] 错误不会导致安全状态

### 发布前检查

- [ ] 运行完整的安全审计
- [ ] 更新 CHANGELOG 中的安全修复
- [ ] 如果有安全修复，发布 Security Advisory
- [ ] 通知受影响的用户

---

## 安全最佳实践总结

### ✅ 应该做的

1. **验证所有输入** - 永远不要信任用户输入
2. **使用 textContent** - 避免 XSS 攻击
3. **验证 URL** - 防止危险协议
4. **限制输入长度** - 防止 DoS 攻击
5. **使用 DOMPurify** - 当必须插入 HTML 时
6. **锁定依赖版本** - 避免意外引入漏洞
7. **定期审计依赖** - 及时发现和修复漏洞
8. **使用 CSP** - 内容安全策略（用户可配置）

### ❌ 不应该做的

1. **不要使用 innerHTML** - 除非使用 DOMPurify 清理
2. **不要使用 eval()** - 永远不要执行用户提供的代码
3. **不要信任用户输入** - 所有输入都可能是恶意的
4. **不要在错误消息中泄露敏感信息** - 路径、配置等
5. **不要使用过时的依赖** - 可能包含已知漏洞
6. **不要忽略安全警告** - npm audit 的警告要认真对待
7. **不要公开披露未修复的漏洞** - 给攻击者可乘之机

---

## 相关文档

- [错误处理策略](../guides/error-handling.md) - 安全相关的错误处理
- [代码规范](../guides/code-style.md) - 安全编码规范
- [测试策略](../testing/README.md) - 安全测试

---

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Snyk](https://snyk.io/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
