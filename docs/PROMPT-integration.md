# 任务提示词：Hugo 主题集成 @ouraihub/hugo-shared

你需要将三个 Hugo 主题逐个接入 `@ouraihub/hugo-shared` 共享模块。

## 项目路径

- ui-library: `/home/administrator/workspace/open-source/ui-dev/ui-library`
- hugo-shared 包: `/home/administrator/workspace/open-source/ui-dev/ui-library/packages/hugo-shared`
- hugowind: `/home/administrator/workspace/open-source/hugowind`
- hugo-butterfly: `/home/administrator/workspace/open-source/hugo-butterfly`
- hugo-theme-fluid: `/home/administrator/workspace/open-source/hugo-theme-fluid`

## 设计文档

严格按照 `ui-library/docs/hugo-shared-integration-guide.md` 执行。先完整阅读该文档。

## 执行顺序

必须按此顺序，不要跳：

### 第一步：改 shared 包加 fallback（步骤 0）

在 `packages/hugo-shared/partials/seo-meta.html` 中加 fallback 兼容逻辑（见文档"步骤 0"部分）。改完后确认 paper 仍能正常运行：

```bash
cd /home/administrator/workspace/open-source/hugo-theme-paper
pnpm sync:shared
pnpm dev  # 确认不报错
```

### 第二步：集成 hugowind

```bash
cd /home/administrator/workspace/open-source/hugowind
git checkout -b feat/integrate-hugo-shared
```

按文档中 "hugowind 集成" 部分执行。完成后：
```bash
pnpm dev  # 访问 http://localhost:1313 验证所有功能
```

### 第三步：集成 hugo-butterfly

```bash
cd /home/administrator/workspace/open-source/hugo-butterfly
git checkout -b feat/integrate-hugo-shared
```

按文档中 "hugo-butterfly 集成" 部分执行。**注意：必须删除整个 `head/seo.html`，不能保留部分。**

### 第四步：集成 hugo-theme-fluid

```bash
cd /home/administrator/workspace/open-source/hugo-theme-fluid
git checkout -b feat/integrate-hugo-shared
```

按文档中 "hugo-theme-fluid 集成" 部分执行。**注意：DOM 属性从 `data-user-color-scheme` 改为 `data-theme`，CSS 全局替换。**

## 执行规则

1. **先读完 `docs/hugo-shared-integration-guide.md`**
2. **每个主题完成后 `pnpm dev` 验证**，确认无报错再 commit
3. **DOM 属性迁移时**，用编辑器全局替换，不要手动逐行改
4. **遇到文档没覆盖的情况**，停下来问我
5. **每个主题一个 commit**，message 格式：`feat: integrate @ouraihub/hugo-shared`

## 验收标准

每个主题完成后检查：

```bash
pnpm dev
# 访问 http://localhost:1313 确认：
# - 首页正常
# - 文章页正常
# - 主题切换正常（无闪烁）
# - 代码高亮亮/暗切换正常
# - 语言切换正常（如果有多语言）

# 技术验证：
ls layouts/partials/shared/           # 应该有 9 个 html
grep "hugo-shared" package.json       # 应该有依赖
grep "shared/" layouts/_default/baseof.html  # 应该有 shared partial 引用
```

全部三个主题通过后告诉我"集成完成"。

开始吧。先读 `docs/hugo-shared-integration-guide.md`，然后从步骤 0 开始。
