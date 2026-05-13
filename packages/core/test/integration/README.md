# 集成测试文档

## 概述

本目录包含 ThemeManager 与 DOM 工具的集成测试，验证核心功能在真实场景下的协同工作。

## 测试文件

### theme-dom.test.ts

测试 ThemeManager 与 DOM 工具（querySelector、debounce、throttle）的集成。

## 测试覆盖场景

### 1. ThemeManager + querySelector 集成 (6 个测试)

- ✅ 应用主题到动态查询的元素
- ✅ 使用 querySelector 处理主题变化
- ✅ 主题变化时更新多个元素
- ✅ 优雅处理不存在的元素
- ✅ 处理 DOM 元素移除
- ✅ 处理复杂 DOM 结构

### 2. 事件系统 + DOM 操作 (6 个测试)

- ✅ 通过 onThemeChange 触发 DOM 更新
- ✅ 单次主题变化处理多个 DOM 更新
- ✅ 与 debounce 函数配合工作
- ✅ 与 throttle 函数配合工作
- ✅ 防抖场景：快速连续变化只执行最后一次
- ✅ 节流场景：限制执行频率

### 3. 多实例协同 (3 个测试)

- ✅ 管理独立的主题状态
- ✅ 协调多实例的共享 DOM 更新
- ✅ 处理跨实例 DOM 查询

### 4. 内存泄漏检测 (6 个测试)

- ✅ 取消订阅时清理事件监听器
- ✅ 回调中不泄漏 DOM 引用
- ✅ 处理快速订阅/取消订阅循环
- ✅ 清理防抖回调
- ✅ 清理节流回调
- ✅ 验证监听器正确移除

### 5. 边界情况 (6 个测试)

- ✅ 主题变化期间 DOM 元素移除
- ✅ 同一元素重复初始化
- ✅ 空容器的主题变化
- ✅ 复杂 DOM 结构（深层嵌套）
- ✅ 并发主题变化
- ✅ 回调执行期间的主题变化

### 6. 真实场景 (3 个测试)

- ✅ 主题切换按钮 + DOM 更新
- ✅ 跨页面重载的主题持久化
- ✅ 主题感知组件初始化

## 测试统计

- **总测试数**: 30 个
- **测试套件**: 6 个
- **预期覆盖率**: > 85%
- **预期执行时间**: < 5 秒

## 运行测试

```bash
# 运行所有集成测试
pnpm test test/integration

# 运行特定集成测试
pnpm test theme-dom

# 监听模式
pnpm test:watch theme-dom
```

## 测试环境

- **测试框架**: Vitest
- **DOM 环境**: jsdom
- **定时器**: vi.useFakeTimers()
- **模拟**: vi.fn(), vi.spyOn()

## 测试原则

1. **独立性**: 每个测试独立运行，不依赖其他测试
2. **可重复性**: 测试结果稳定，可重复执行
3. **快速**: 使用 fake timers，避免真实延迟
4. **真实性**: 模拟真实浏览器环境和用户交互
5. **清理**: 每个测试后清理 DOM 和 localStorage

## 关键测试模式

### 模式 1: DOM 查询 + 主题变化

```typescript
const themeManager = new ThemeManager(container);
themeManager.onThemeChange((theme) => {
  const elements = qsa('.target', container);
  elements.forEach(el => el.setAttribute('data-theme', theme));
});
themeManager.setTheme('dark');
```

### 模式 2: 防抖 + 主题变化

```typescript
vi.useFakeTimers();
const debouncedUpdate = debounce(() => { /* update */ }, 100);
themeManager.onThemeChange(debouncedUpdate);
themeManager.setTheme('light');
themeManager.setTheme('dark'); // 只有这个会执行
vi.advanceTimersByTime(100);
vi.useRealTimers();
```

### 模式 3: 多实例协同

```typescript
const manager1 = new ThemeManager(container1, { storageKey: 'theme1' });
const manager2 = new ThemeManager(container2, { storageKey: 'theme2' });
manager1.setTheme('light');
manager2.setTheme('dark');
// 两个实例独立工作
```

### 模式 4: 内存泄漏检测

```typescript
const callback = vi.fn();
const unsubscribe = themeManager.onThemeChange(callback);
themeManager.setTheme('light'); // callback 被调用
unsubscribe();
themeManager.setTheme('dark'); // callback 不被调用
```

## 已知限制

1. **jsdom 限制**: 不支持某些浏览器 API（如 IntersectionObserver）
2. **CSS 计算**: jsdom 不执行 CSS 布局计算
3. **动画**: 不测试 CSS 动画和过渡效果
4. **真实浏览器**: 不测试浏览器特定行为

## 未来改进

- [ ] 添加性能基准测试
- [ ] 添加可访问性测试
- [ ] 添加跨浏览器兼容性测试
- [ ] 添加 E2E 测试（Playwright）
- [ ] 添加视觉回归测试

## 维护指南

### 添加新测试

1. 在相应的 `describe` 块中添加测试
2. 遵循现有测试模式
3. 确保测试独立且可重复
4. 添加清理逻辑（afterEach）
5. 更新本文档

### 调试失败测试

1. 检查 beforeEach/afterEach 清理逻辑
2. 验证 fake timers 使用正确
3. 检查 DOM 元素是否正确创建/销毁
4. 验证 localStorage 是否正确清理
5. 使用 `test.only()` 隔离问题测试

## 相关文档

- [ThemeManager API](../../src/theme/README.md)
- [DOM 工具 API](../../../utils/src/dom/README.md)
- [测试策略](../../../../docs/testing/README.md)
- [单元测试](../theme/ThemeManager.test.ts)
