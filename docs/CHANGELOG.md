# 文档变更日志

本文档记录 @ouraihub/ui-library 文档的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.5.0] - 2026-05-12

### Fixed
- **P0 修复**: 修复关键可用性问题
  - 统一所有文档版本号为 1.4.0（之前版本号混乱：0.1.0/1.0.0/1.1.0）
  - 统一组织名为 `@ouraihub`（快速开始指南之前使用 `@your-org` 占位符）
  - 修复文档引用：移除"（待创建）"标记，修正 `browser-compatibility.md` → `browsers.md`
  - 移除硬编码路径：`E:\workspace\ui-dev` → `<your-workspace>`

### Added
- **P1 用户体验优化**: 提升文档可用性
  - README.md 添加"5分钟快速了解"电梯演讲式介绍
  - 添加决策树式导航：基于角色/目标的文档阅读路径表格
  - 添加可视化架构图：Mermaid 图展示整体架构和包依赖关系
  - 快速开始指南添加"步骤 0: 环境准备"章节
  - 快速开始指南添加代码配置说明（top-level await、exports 字段）

### Changed
- **文档版本**: 所有文档版本统一升级到 v1.4.0
- **快速开始指南**: 改进代码示例，添加关键配置说明和自定义组织名指引

---

## [1.4.0] - 2026-05-12

### Added
- **P1 工程化文档**: 创建 5 个高优先级文档
  - `deployment/README.md`: 部署和发布指南（npm 发布、版本管理、CI/CD）
  - `guides/performance.md`: 性能优化策略（包体积、代码分割、懒加载、缓存）
  - `guides/migration.md`: 迁移指南（从独立代码迁移、版本升级、兼容性处理）
  - `guides/code-style.md`: 代码规范（TypeScript、CSS、命名约定、Git 提交）
  - `guides/troubleshooting.md`: 故障排查指南（常见问题、调试技巧、FAQ）

### Changed
- **文档版本**: 所有 P1 文档版本升级到 v1.4.0
- **文档完整性**: 完成所有 P0 和 P1 优先级文档任务

---

## [1.3.0] - 2026-05-12

### Added
- **部署和发布指南** (`deployment/README.md`): 完整的发布流程文档
  - npm 发布流程（手动和自动）
  - 版本管理策略（SemVer + Changesets）
  - CI/CD 集成（GitHub Actions + npm provenance）
  - 发布检查清单（发布前/后验证）
  - 回滚策略和紧急修复流程
  - Prerelease 发布流程
  - 多注册表发布配置

### Changed
- **文档版本**: 部署相关文档版本升级到 v1.3.0

---

## [1.2.0] - 2026-05-12

### Added
- **可视化图表**: 使用 Mermaid 添加架构和流程图
  - `DESIGN.md`: 添加架构可视化图（分层架构）和事件流程图（主题切换）
  - `architecture/02-component-library-design.md`: 添加包依赖关系图
  - `implementation/01-roadmap.md`: 添加实施时间线甘特图
- **P0 核心文档**: 创建 5 个工程化文档
  - `api/README.md`: 完整的 API 参考文档（ThemeManager、SearchModal 等）
  - `testing/README.md`: 测试策略（测试金字塔、覆盖率要求、CI 集成）
  - `guides/error-handling.md`: 错误处理策略（自定义错误类、恢复机制）
  - `guides/security.md`: 安全性文档（XSS/CSRF 防护、依赖审计）
  - `compatibility/browsers.md`: 浏览器兼容性矩阵

### Changed
- **文档版本**: 所有核心文档版本从 v1.1.0 升级到 v1.2.0

---

## [1.1.0] - 2026-05-12

### Added
- **架构决策记录（ADR）**: 创建 `docs/decisions/` 目录，记录 4 个重要架构决策
  - ADR-001: 采用混合架构（核心逻辑 + 薄包装层）
  - ADR-002: 不使用 Web Components
  - ADR-003: 使用 CSS 变量而非 CSS-in-JS
  - ADR-004: Monorepo 结构设计
- **文档交叉引用**: 在关键概念处添加文档链接，建立文档间的导航关系
- **文档变更日志**: 创建 `CHANGELOG.md`（本文档）

### Changed
- **统一文档入口**: 删除旧的 `README.md`，将 `INDEX.md` 重命名为 `README.md`
- **移除时间维度**: 将所有"第X周"改为 P0/P1/P2 优先级体系
  - `DESIGN.md`: "第1周" → "必须完成"，"第2-3周" → "强烈建议"，"第4周+" → "可选"
  - `README.md`: 同步更新优先级描述
- **增强文档导航**: 在 `README.md`、`DESIGN.md`、`IMPLEMENTATION_PLAN.md` 中添加相关文档链接

### Fixed
- **文档一致性**: 解决 `README.md` 和 `INDEX.md` 内容重复但不一致的问题
- **引用准确性**: 修复 `README.md` 中引用不存在文件的问题（如 `03-tech-stack.md`）

---

## [1.0.0] - 2026-05-12

### Added
- **完整设计方案** (`DESIGN.md`): 混合架构设计、技术选型、组件设计
- **实施计划** (`IMPLEMENTATION_PLAN.md`): P0/P1/P2 文档补充任务清单
- **深度评审报告** (`OPTIMIZATION.md`): 文档质量评审与优化建议
- **初步评审报告** (`REVIEW.md`): 设计方案初步评审

#### 分析文档 (`analysis/`)
- `01-projects-overview.md`: 项目概览与技术栈对比
- `02-code-duplication.md`: 跨项目代码重复分析（~2,850-4,000 行）
- `03-project-details.md`: 项目详细分析

#### 架构文档 (`architecture/`)
- `01-pagefind-study.md`: Pagefind 架构深度研究
- `02-component-library-design.md`: 组件库架构设计方案

#### 实施文档 (`implementation/`)
- `01-roadmap.md`: 完整实施路线图
- `02-quick-start.md`: 快速开始指南

### Decisions
- **混合架构**: 核心逻辑用纯 TypeScript 类，UI 层用框架专用薄包装
- **不使用 Web Components**: SSG + Tailwind v4 场景不适合
- **CSS 变量 + Tailwind**: 主题化方案
- **pnpm workspace + Turborepo**: Monorepo 工具链

---

## 文档统计

| 版本 | 文档数 | 总大小 | 主要变更 |
|------|--------|--------|---------|
| 1.2.0 | 17 | ~285 KB | 添加 Mermaid 可视化图表 |
| 1.1.0 | 17 | ~280 KB | 添加 ADR、交叉引用、统一优先级 |
| 1.0.0 | 12 | ~133 KB | 初始版本，完整设计文档 |

---

## 文档版本说明

### 版本号格式

文档版本号采用 `MAJOR.MINOR.PATCH` 格式：

- **MAJOR**: 重大变更（架构调整、设计推翻）
- **MINOR**: 新增内容（新文档、新章节）
- **PATCH**: 修复和优化（错别字、格式、小改进）

### 文档状态

每个文档可能处于以下状态之一：

- **draft**: 草稿，内容未完成
- **review**: 评审中，等待反馈
- **approved**: 已批准，可以使用
- **deprecated**: 已废弃，不再维护

---

## 维护指南

### 如何更新 CHANGELOG

1. **每次文档变更都要记录**
2. **按类型分类**: Added（新增）、Changed（变更）、Deprecated（废弃）、Removed（删除）、Fixed（修复）、Security（安全）
3. **使用现在时态**: "添加 ADR" 而非 "添加了 ADR"
4. **包含文件路径**: 方便读者找到变更的文件
5. **链接相关 Issue/PR**: 如果有的话

### 示例

```markdown
## [1.2.0] - 2026-05-13

### Added
- **API 参考文档** (`docs/api/README.md`): ThemeManager、SearchModal 等核心 API 文档

### Changed
- **DESIGN.md**: 更新架构图，添加事件流程说明

### Fixed
- **IMPLEMENTATION_PLAN.md**: 修复任务编号错误
```

---

## 相关文档

- [项目总览](./README.md) - 文档索引和快速导航
- [完整设计方案](./DESIGN.md) - 技术方案详细说明
- [实施计划](./IMPLEMENTATION_PLAN.md) - 文档补充任务清单
- [深度评审报告](./OPTIMIZATION.md) - 文档质量评审

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
