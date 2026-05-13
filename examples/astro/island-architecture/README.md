# Astro Island 架构集成示例

🚧 **此示例尚未实现，将在 Astro 包装层完成后添加。**

## 计划功能

- ✅ Island 架构集成
- ✅ 部分水合（Partial Hydration）
- ✅ 客户端指令支持
- ✅ 性能优化

## 预计文件结构

```
island-architecture/
├── README.md
├── src/
│   ├── components/
│   │   ├── ThemeToggle.astro
│   │   └── ThemeProvider.astro
│   └── pages/
│       └── index.astro
└── astro.config.mjs
```

## 预计使用方式

```astro
---
import ThemeToggle from '@ouraihub/ui-library/astro';
---

<ThemeToggle client:load />
<ThemeToggle client:visible />
<ThemeToggle client:idle />
```

## 开发状态

- [ ] Island 架构设计
- [ ] 客户端指令支持
- [ ] 示例代码
- [ ] 文档

## 预计完成时间

待定（取决于 Astro 包装层开发进度）

## 许可证

MIT
