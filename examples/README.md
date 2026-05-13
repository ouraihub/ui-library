# 使用示例

本目录包含 @ouraihub/ui-library 的完整使用示例，涵盖 Hugo 和 Astro 的实际使用场景。

## 目录结构

```
examples/
├── hugo/              # Hugo 使用示例
│   ├── basic-theme-toggle/      # 基础主题切换
│   ├── custom-styling/          # 自定义样式
│   ├── multiple-instances/      # 多实例使用
│   ├── navigation/              # 导航菜单
│   ├── lazy-loading/            # 懒加载
│   └── search/                  # 搜索模态框
├── astro/             # Astro 使用示例（占位）
│   ├── basic-theme-toggle/      # 基础主题切换
│   └── island-architecture/     # Island 架构集成
├── common/            # 通用场景示例
│   ├── theme-persistence.ts     # 主题持久化
│   ├── system-theme-sync.ts     # 系统主题同步
│   └── custom-themes.ts         # 自定义主题
└── README.md          # 本文件
```

## Hugo 示例

### 1. 基础主题切换
最简单的主题切换实现，适合快速上手。

**路径**: `hugo/basic-theme-toggle/`  
**难度**: ⭐  
**时间**: 5 分钟

### 2. 自定义样式
展示如何自定义主题切换按钮的样式和行为。

**路径**: `hugo/custom-styling/`  
**难度**: ⭐⭐  
**时间**: 10 分钟

### 3. 多实例使用
在同一页面使用多个主题切换按钮。

**路径**: `hugo/multiple-instances/`  
**难度**: ⭐⭐  
**时间**: 10 分钟

### 4. 导航菜单
完整的响应式导航菜单，支持移动端菜单和下拉菜单。

**路径**: `hugo/navigation/`  
**难度**: ⭐⭐⭐  
**时间**: 20 分钟

### 5. 懒加载
图片和内容懒加载，提升页面加载性能。

**路径**: `hugo/lazy-loading/`  
**难度**: ⭐⭐  
**时间**: 15 分钟

### 6. 搜索模态框
全功能搜索模态框，支持键盘快捷键和防抖搜索。

**路径**: `hugo/search/`  
**难度**: ⭐⭐⭐  
**时间**: 25 分钟

### 7. SEO 优化
完整的 SEO 元数据管理，包括 Meta 标签、Open Graph、Schema.org。

**路径**: `hugo/seo/`  
**难度**: ⭐⭐⭐  
**时间**: 30 分钟

## Astro 示例（占位）

### 1. 基础主题切换
Astro 项目中的基础主题切换实现。

**路径**: `astro/basic-theme-toggle/`  
**状态**: 🚧 待实现

### 2. Island 架构集成
展示如何在 Astro 的 Island 架构中使用组件。

**路径**: `astro/island-architecture/`  
**状态**: 🚧 待实现

## 通用场景示例

### 1. 主题持久化
展示如何实现主题设置的持久化存储。

**文件**: `common/theme-persistence.ts`  
**适用**: Hugo + Astro

### 2. 系统主题同步
展示如何监听和同步系统主题变化。

**文件**: `common/system-theme-sync.ts`  
**适用**: Hugo + Astro

### 3. 自定义主题
展示如何扩展和自定义主题系统。

**文件**: `common/custom-themes.ts`  
**适用**: Hugo + Astro

## 快速开始

### Hugo 项目

1. 选择一个示例目录（如 `hugo/basic-theme-toggle/`）
2. 阅读该目录下的 `README.md`
3. 按照步骤复制代码到你的项目
4. 运行 `hugo server` 查看效果

### Astro 项目

1. 选择一个示例目录（如 `astro/basic-theme-toggle/`）
2. 阅读该目录下的 `README.md`
3. 按照步骤复制代码到你的项目
4. 运行 `npm run dev` 查看效果

## 运行要求

### Hugo 示例
- Hugo v0.112.0+
- Node.js 18+（用于构建 TypeScript）

### Astro 示例
- Astro v4.0.0+
- Node.js 18+

## 常见问题

### Q: 示例代码可以直接用于生产环境吗？

A: 可以。所有示例都遵循最佳实践，包含完整的错误处理和类型安全。

### Q: 如何自定义示例代码？

A: 每个示例都包含详细的代码注释，说明可自定义的部分。参考注释修改即可。

### Q: 示例代码的浏览器兼容性如何？

A: 支持所有现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）。

### Q: 遇到问题怎么办？

A: 
1. 检查示例目录下的 `README.md` 中的"常见问题"部分
2. 查看项目根目录的 `docs/guides/troubleshooting.md`
3. 提交 Issue 到 GitHub 仓库

## 贡献示例

欢迎贡献新的使用示例！请遵循以下规范：

1. 每个示例必须包含 `README.md`
2. 代码必须包含详细注释
3. 必须说明预期效果
4. 必须包含运行步骤
5. 代码必须可以直接运行

## 许可证

所有示例代码采用 MIT 许可证，可自由使用和修改。
