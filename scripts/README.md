# 循环依赖检测

本目录包含循环依赖检测工具，用于确保 Monorepo 中的包之间没有循环依赖。

## 文件说明

- `check-circular-deps.js` - 循环依赖检测脚本

## 使用方法

### 基本检测

```bash
pnpm check:circular
```

### 生成依赖关系图

```bash
pnpm check:circular:graph
```

生成的图表保存在根目录的 `dependency-graph.svg`。

### 显示统计信息

```bash
pnpm check:circular:stats
```

## 自动化

### Pre-commit Hook

每次提交前会自动运行循环依赖检测。如果发现循环依赖，提交会被阻止。

### CI/CD

GitHub Actions 会在每次 push 和 pull request 时运行检测。

## 配置

检测脚本会扫描 `packages/` 目录中的所有 TypeScript 和 JavaScript 文件，排除：

- `node_modules/`
- `dist/`
- 测试文件（`*.test.*`, `*.spec.*`, `__tests__/`, `test/`）

## 故障排查

如果检测失败：

1. 查看错误信息，找到循环依赖的路径
2. 重构代码，打破循环依赖
3. 常见解决方案：
   - 提取共享代码到新的包
   - 使用依赖注入
   - 重新设计模块结构

## 示例输出

### 成功

```
🔍 Checking for circular dependencies...

✅ No circular dependencies found!
```

### 失败

```
🔍 Checking for circular dependencies...

❌ Circular dependencies detected:

  1. packages/core/index.ts → packages/hugo/index.ts → packages/core/index.ts

💡 Fix these circular dependencies before proceeding.
```
