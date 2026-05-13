# Hugo 包装层集成测试

## 测试文件

- `auto-init.test.ts` - Hugo 包装层自动初始化集成测试

## 运行测试

### 前置条件

确保已安装依赖：

```bash
pnpm install
```

### 运行所有集成测试

```bash
# 从项目根目录运行
pnpm test

# 或者只运行 Hugo 包装层的集成测试
pnpm vitest run packages/hugo/__tests__/integration/
```

### 运行单个测试文件

```bash
pnpm vitest run packages/hugo/__tests__/integration/auto-init.test.ts
```

### 监听模式

```bash
pnpm vitest watch packages/hugo/__tests__/integration/
```

## 测试场景

### auto-init.test.ts

测试 Hugo 包装层的自动初始化功能：

1. **data 属性自动扫描**
   - 自动扫描 `[data-ui-component="theme-toggle"]` 元素
   - 读取 `data-ui-storage-key` 属性
   - 读取 `data-ui-attribute` 属性

2. **多个组件同时初始化**
   - 同时初始化多个主题切换按钮
   - 多个按钮独立工作

3. **初始化顺序验证**
   - DOM 加载完成后初始化
   - 先从 localStorage 加载，再应用主题
   - 应用主题后监听系统主题变化

4. **错误处理**
   - 缺少 `data-ui-storage-key`（使用默认值）
   - 缺少 `data-ui-attribute`（使用默认值）
   - localStorage 不可用
   - 无效的 localStorage 值
   - 没有匹配元素

5. **DOM 变化后的重新初始化**
   - DOM 变化后重新初始化
   - 按钮被移除
   - 按钮被替换

6. **真实 Hugo partial 输出模拟**
   - 处理完整的 Hugo partial 输出（包含样式和结构）

## 测试环境

- **测试框架**: Vitest
- **DOM 模拟**: jsdom
- **覆盖率**: v8

## 预期结果

所有测试应该通过，覆盖率应达到：
- 语句覆盖率: 80%+
- 分支覆盖率: 80%+
- 函数覆盖率: 80%+
- 行覆盖率: 80%+
