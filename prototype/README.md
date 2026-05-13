# Batch 0.5: 快速原型验证

## 目标

在 2-3 小时内创建最小可行原型，验证核心假设：
1. ThemeManager 的 API 设计是否合理
2. Hugo 包装层的自动初始化是否可行
3. 防闪烁机制是否有效
4. 在真实项目（hugo-theme-paper）中是否能正常工作

## 文件清单

### 1. ThemeManager.ts
- 核心主题管理类
- 支持 light/dark/system 三态
- localStorage 持久化
- 媒体查询监听
- 事件订阅

### 2. anti-flicker.ts
- 防闪烁脚本
- 可内联到 `<head>`
- 最小化代码（< 200 字节）

### 3. theme-toggle.html
- Hugo partial 模板
- 使用 data 属性配置
- 基础样式

### 4. init.ts
- 自动初始化脚本
- 扫描 `[data-ui-component]` 元素
- 自动绑定事件

## 验证步骤

### 步骤 1: 构建原型

```bash
cd E:\workspace\ui-dev\ui-library\prototype
npx esbuild ThemeManager.ts --bundle --format=esm --outfile=dist/theme-manager.js
npx esbuild init.ts --bundle --format=esm --outfile=dist/init.js
npx esbuild anti-flicker.ts --bundle --format=esm --outfile=dist/anti-flicker.js
```

### 步骤 2: 集成到 hugo-theme-paper

1. 复制文件到 hugo-theme-paper：
   ```bash
   cp prototype/theme-toggle.html ../hugo-theme-paper/layouts/partials/
   cp prototype/dist/init.js ../hugo-theme-paper/static/js/
   cp prototype/dist/anti-flicker.js ../hugo-theme-paper/static/js/
   ```

2. 在 `<head>` 中添加防闪烁脚本：
   ```html
   <script>{{ readFile "static/js/anti-flicker.js" | safeJS }}</script>
   ```

3. 在页面中使用主题切换：
   ```html
   {{ partial "theme-toggle.html" . }}
   <script type="module" src="/js/init.js"></script>
   ```

### 步骤 3: 测试验证

- [ ] 主题切换功能正常
- [ ] 刷新页面主题保持
- [ ] 系统主题跟随生效
- [ ] 无闪烁现象
- [ ] 控制台无错误

## 验收标准

✅ **成功标准**：
1. 主题切换功能完全正常
2. 无闪烁现象
3. 性能可接受（< 100ms）
4. 代码简洁（< 200 行）

❌ **失败标准**：
1. 有明显闪烁
2. 性能问题（> 500ms）
3. API 设计不合理
4. 集成困难

## 决策点

验证完成后，决定：
- ✅ **继续**: 核心假设验证成功，开始正式实施 Batch 1
- ⚠️ **调整**: 发现小问题，调整设计后继续
- ❌ **重新设计**: 发现重大问题，需要重新设计架构

## 时间记录

- 开始时间: [待填写]
- 完成时间: [待填写]
- 实际用时: [待填写]
