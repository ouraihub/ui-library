# 部署和发布指南

> **版本**: 1.4.0  
> **最后更新**: 2026-05-12  
> **状态**: active  
> **维护者**: Sisyphus (AI Agent)

本文档定义 `@ouraihub/ui-library` monorepo 的发布流程、版本管理策略、CI/CD 配置和发布检查清单。

---

## 目录

- [发布策略](#发布策略)
- [版本管理](#版本管理)
- [发布流程](#发布流程)
- [CI/CD 集成](#cicd-集成)
- [发布检查清单](#发布检查清单)
- [回滚策略](#回滚策略)

---

## 发布策略

### Monorepo 发布模式

我们使用 **独立版本** 策略，每个包独立管理版本号：

| 包 | 版本策略 | 发布频率 |
|---|---|---|
| `@ouraihub/core` | 独立版本 | 每个功能/修复 |
| `@ouraihub/styles` | 独立版本 | 每个样式更新 |
| `@ouraihub/hugo` | 独立版本 | 跟随 core 更新 |
| `@ouraihub/astro` | 独立版本 | 跟随 core 更新 |

### 发布顺序

由于包之间存在依赖关系，必须按以下顺序发布：

```
1. @ouraihub/core (核心逻辑)
   ↓
2. @ouraihub/styles (样式系统)
   ↓
3. @ouraihub/hugo + @ouraihub/astro (并行发布)
```

### 发布类型

| 类型 | 触发条件 | 示例 |
|------|---------|------|
| **Patch** | Bug 修复、文档更新 | 1.0.0 → 1.0.1 |
| **Minor** | 新功能（向后兼容） | 1.0.0 → 1.1.0 |
| **Major** | 破坏性变更 | 1.0.0 → 2.0.0 |
| **Prerelease** | Alpha/Beta 测试 | 1.0.0 → 1.1.0-beta.0 |

---

## 版本管理

### 语义化版本 (SemVer)

遵循 [Semantic Versioning 2.0.0](https://semver.org/)：

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

示例:
- 1.0.0          (稳定版本)
- 1.1.0-beta.0   (Beta 测试版)
- 2.0.0-rc.1     (Release Candidate)
- 1.0.0+20260512 (带构建元数据)
```

### 版本号规则

#### Major (破坏性变更)

```typescript
// ❌ 破坏性变更 - 需要 Major 版本
// v1.x
class ThemeManager {
  setTheme(theme: string): void { }
}

// v2.0.0
class ThemeManager {
  setTheme(theme: Theme): void { } // 参数类型改变
}
```

#### Minor (新功能)

```typescript
// ✅ 向后兼容的新功能 - Minor 版本
// v1.0.0
class ThemeManager {
  setTheme(theme: string): void { }
}

// v1.1.0
class ThemeManager {
  setTheme(theme: string): void { }
  getTheme(): string { } // 新增方法
}
```

#### Patch (Bug 修复)

```typescript
// ✅ Bug 修复 - Patch 版本
// v1.0.0
class ThemeManager {
  setTheme(theme: string): void {
    localStorage.setItem('theme', theme); // Bug: 没有错误处理
  }
}

// v1.0.1
class ThemeManager {
  setTheme(theme: string): void {
    try {
      localStorage.setItem('theme', theme); // 修复: 添加错误处理
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  }
}
```

### Changesets 工具

使用 [Changesets](https://github.com/changesets/changesets) 管理版本和 changelog：

#### 安装

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

#### 配置

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

#### 工作流程

```bash
# 1. 开发功能
git checkout -b feat/new-feature

# 2. 添加 changeset
pnpm changeset
# 选择包: @ouraihub/core
# 选择类型: minor
# 描述变更: Add new theme transition API

# 3. 提交代码
git add .
git commit -m "feat(core): add theme transition API"

# 4. 合并到 main 后，发布版本
pnpm changeset version  # 更新版本号和 CHANGELOG
pnpm changeset publish  # 发布到 npm
```

---

## 发布流程

### 手动发布

#### 1. 准备发布

```bash
# 确保在 main 分支
git checkout main
git pull origin main

# 确保依赖最新
pnpm install

# 运行完整测试
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
```

#### 2. 更新版本

```bash
# 使用 changesets 更新版本
pnpm changeset version

# 这会:
# - 更新所有包的 package.json 版本号
# - 生成/更新 CHANGELOG.md
# - 删除已处理的 changeset 文件
```

#### 3. 构建包

```bash
# 构建所有包
pnpm build

# 验证构建产物
ls -R packages/*/dist
```

#### 4. 发布到 npm

```bash
# 发布所有包（按依赖顺序）
pnpm changeset publish

# 或手动发布单个包
cd packages/core
npm publish --access public
```

#### 5. 推送标签

```bash
# Changesets 会自动创建 git tags
git push --follow-tags
```

#### 6. 创建 GitHub Release

```bash
# 使用 GitHub CLI
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes-file CHANGELOG.md
```

### 自动发布 (推荐)

使用 GitHub Actions 自动化发布流程。

#### GitHub Actions 配置

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          title: 'chore: release packages'
          commit: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        if: steps.changesets.outputs.published == 'true'
        run: |
          for package in ${{ steps.changesets.outputs.publishedPackages }}; do
            gh release create "${package}" \
              --title "${package}" \
              --generate-notes
          done
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 工作流程

1. **开发者提交代码** → 包含 changeset 文件
2. **合并到 main** → 触发 GitHub Actions
3. **Changesets Action**:
   - 如果有 changeset → 创建 "Version Packages" PR
   - 如果 PR 被合并 → 自动发布到 npm
4. **自动创建 GitHub Release**

### Prerelease 发布

用于 Alpha/Beta 测试：

```bash
# 进入 prerelease 模式
pnpm changeset pre enter beta

# 添加 changeset
pnpm changeset
# 版本: minor
# 描述: Beta release for testing

# 更新版本 (会生成 1.1.0-beta.0)
pnpm changeset version

# 发布
pnpm changeset publish --tag beta

# 退出 prerelease 模式
pnpm changeset pre exit
```

用户安装 prerelease 版本：

```bash
# 安装 beta 版本
pnpm add @ouraihub/core@beta

# 安装特定 prerelease 版本
pnpm add @ouraihub/core@1.1.0-beta.0
```

---

## CI/CD 集成

### npm Provenance

启用 npm provenance 提高供应链安全：

```yaml
# .github/workflows/release.yml
- name: Publish with provenance
  run: pnpm changeset publish --provenance
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

这会在 npm 包页面显示：
- ✅ 构建来源（GitHub Actions）
- ✅ 提交 SHA
- ✅ 工作流文件

### 发布前检查

```yaml
# .github/workflows/release.yml
- name: Pre-publish checks
  run: |
    # 类型检查
    pnpm typecheck
    
    # 代码检查
    pnpm lint
    
    # 单元测试
    pnpm test
    
    # E2E 测试
    pnpm test:e2e
    
    # 构建检查
    pnpm build
    
    # 包大小检查
    pnpm exec size-limit
```

### 发布通知

```yaml
# .github/workflows/release.yml
- name: Notify on Slack
  if: steps.changesets.outputs.published == 'true'
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚀 New release: ${{ steps.changesets.outputs.publishedPackages }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 发布检查清单

### 发布前检查

- [ ] **代码质量**
  - [ ] 所有测试通过 (`pnpm test`)
  - [ ] E2E 测试通过 (`pnpm test:e2e`)
  - [ ] 无 lint 错误 (`pnpm lint`)
  - [ ] 无类型错误 (`pnpm typecheck`)
  - [ ] 代码覆盖率 ≥80%

- [ ] **文档**
  - [ ] CHANGELOG.md 已更新
  - [ ] API 文档已更新
  - [ ] 迁移指南已更新（如有破坏性变更）
  - [ ] README.md 版本号已更新

- [ ] **构建**
  - [ ] 构建成功 (`pnpm build`)
  - [ ] 构建产物完整（检查 `dist/` 目录）
  - [ ] 包大小在合理范围内
  - [ ] Source maps 已生成

- [ ] **依赖**
  - [ ] 依赖版本已更新
  - [ ] 无安全漏洞 (`pnpm audit`)
  - [ ] peer dependencies 正确声明

- [ ] **版本**
  - [ ] 版本号符合 SemVer
  - [ ] package.json 版本号一致
  - [ ] Git tag 已创建

### 发布后验证

- [ ] **npm 验证**
  - [ ] 包已发布到 npm (`npm view @ouraihub/core`)
  - [ ] 包可以安装 (`pnpm add @ouraihub/core@latest`)
  - [ ] 包内容正确 (`npm pack --dry-run`)
  - [ ] npm provenance 显示正确

- [ ] **功能验证**
  - [ ] 在新项目中测试安装
  - [ ] 核心功能正常工作
  - [ ] 无运行时错误
  - [ ] TypeScript 类型正确

- [ ] **文档验证**
  - [ ] GitHub Release 已创建
  - [ ] CHANGELOG.md 在 GitHub 上可见
  - [ ] 文档网站已更新

- [ ] **通知**
  - [ ] 团队已通知
  - [ ] 用户已通知（如有破坏性变更）
  - [ ] 社交媒体发布（可选）

---

## 回滚策略

### npm 包回滚

#### 1. Deprecate 错误版本

```bash
# 标记版本为废弃
npm deprecate @ouraihub/core@1.2.0 "This version has critical bugs, use 1.1.0 instead"
```

#### 2. 发布修复版本

```bash
# 快速修复并发布 patch 版本
git revert <commit-hash>
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

#### 3. 更新 latest tag

```bash
# 将 latest tag 指向稳定版本
npm dist-tag add @ouraihub/core@1.1.0 latest
```

### Git 回滚

```bash
# 回滚到上一个稳定版本
git revert <commit-hash>
git push origin main

# 删除错误的 tag
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0
```

### 紧急修复流程

```bash
# 1. 创建 hotfix 分支
git checkout -b hotfix/critical-bug v1.1.0

# 2. 修复 bug
# ... 编辑代码 ...

# 3. 添加 changeset
pnpm changeset
# 类型: patch
# 描述: Fix critical security vulnerability

# 4. 发布 hotfix
pnpm changeset version  # 生成 1.1.1
pnpm build
pnpm changeset publish

# 5. 合并回 main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

---

## 包配置

### package.json 配置

每个包的 `package.json` 必须包含：

```json
{
  "name": "@ouraihub/core",
  "version": "1.0.0",
  "description": "Core utilities for UI library",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "provenance": true
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/ouraihub/ui-library.git",
    "directory": "packages/core"
  },
  "keywords": [
    "ui",
    "theme",
    "typescript"
  ],
  "author": "OurAI Hub",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/ouraihub/ui-library/issues"
  },
  "homepage": "https://github.com/ouraihub/ui-library#readme"
}
```

### .npmignore

```
# .npmignore
src/
tests/
*.test.ts
*.spec.ts
tsconfig.json
vitest.config.ts
.turbo/
node_modules/
```

---

## 发布到其他注册表

### GitHub Packages

```yaml
# .github/workflows/publish-gpr.yml
- name: Setup Node for GPR
  uses: actions/setup-node@v4
  with:
    node-version: 20
    registry-url: 'https://npm.pkg.github.com'
    scope: '@ouraihub'

- name: Publish to GPR
  run: pnpm publish --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 私有注册表

```bash
# 配置私有注册表
npm config set @ouraihub:registry https://registry.company.com

# 发布
pnpm publish --registry https://registry.company.com
```

---

## 版本策略示例

### 场景 1: 新功能发布

```bash
# 开发新功能
git checkout -b feat/search-modal

# 完成开发后添加 changeset
pnpm changeset
# 包: @ouraihub/core
# 类型: minor
# 描述: Add SearchModal component with keyboard navigation

# 提交并合并
git commit -m "feat(core): add SearchModal component"
git push origin feat/search-modal
# 创建 PR 并合并

# 合并后，Changesets Action 会:
# 1. 创建 "Version Packages" PR (1.0.0 → 1.1.0)
# 2. 合并后自动发布到 npm
```

### 场景 2: Bug 修复

```bash
# 修复 bug
git checkout -b fix/theme-persistence

# 添加 changeset
pnpm changeset
# 包: @ouraihub/core
# 类型: patch
# 描述: Fix theme not persisting in Safari private mode

# 提交
git commit -m "fix(core): theme persistence in Safari"
# 合并后自动发布 1.1.0 → 1.1.1
```

### 场景 3: 破坏性变更

```bash
# 重大重构
git checkout -b refactor/api-redesign

# 添加 changeset
pnpm changeset
# 包: @ouraihub/core
# 类型: major
# 描述: |
#   BREAKING CHANGE: Redesign ThemeManager API
#   - Rename setTheme() to applyTheme()
#   - Remove deprecated getTheme() method
#   - Change event payload structure

# 更新迁移指南
# 编辑 docs/guides/migration.md

# 提交
git commit -m "refactor(core)!: redesign ThemeManager API"
# 合并后发布 1.1.1 → 2.0.0
```

---

## 相关文档

- [版本管理](../guides/versioning.md) - 详细的版本策略
- [CI/CD 配置](../guides/ci-cd.md) - 完整的 CI/CD 配置
- [迁移指南](../guides/migration.md) - 版本升级指南
- [贡献指南](../../CONTRIBUTING.md) - 开发流程

---

## 工具和资源

- [Changesets](https://github.com/changesets/changesets) - 版本和 changelog 管理
- [Semantic Versioning](https://semver.org/) - 语义化版本规范
- [npm CLI](https://docs.npmjs.com/cli) - npm 命令行文档
- [GitHub Actions](https://docs.github.com/en/actions) - CI/CD 文档

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-12
