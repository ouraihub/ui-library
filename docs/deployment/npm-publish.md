# npm 发布指南

本文档说明如何发布 @ouraihub/ui-library 的各个包到 npm。

## 前置条件

1. **npm 账号**：手动发布时需要 npm 账号并已登录；GitHub Actions 自动发布需要仓库 Secret `NPM_TOKEN`
   ```bash
   npm login
   ```

2. **权限**：确保你有 @ouraihub 组织的发布权限

3. **构建通过**：确保所有测试和构建都通过
   ```bash
   pnpm test
   pnpm build
   ```

## 使用 Changesets 发布

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和发布。

### 1. 创建 Changeset

当你完成一个功能或修复后，创建一个 changeset：

```bash
pnpm changeset
```

按照提示选择：
- 哪些包受到影响
- 版本变更类型（major/minor/patch）
- 变更描述

这会在 `.changeset/` 目录下创建一个 markdown 文件。

### 2. 更新版本

当准备发布时，运行：

```bash
pnpm changeset version
```

这会：
- 读取所有 changeset 文件
- 更新相关包的版本号
- 更新 CHANGELOG.md
- 删除已处理的 changeset 文件

### 3. 发布到 npm

```bash
pnpm release
```

这会：
- 构建所有包
- 发布到 npm
- 创建 git tags

## 手动发布（不推荐）

如果需要手动发布单个包：

```bash
cd packages/core
npm publish --access public
```

## 版本规范

遵循 [Semantic Versioning](https://semver.org/)：

- **Major (1.0.0)**: 破坏性变更
- **Minor (0.1.0)**: 新功能，向后兼容
- **Patch (0.0.1)**: Bug 修复，向后兼容

## 发布检查清单

发布前确保：

- [ ] 所有测试通过 (`pnpm test`)
- [ ] 构建成功 (`pnpm build`)
- [ ] 类型检查通过 (`pnpm typecheck`)
- [ ] 无循环依赖 (`pnpm check:circular`)
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号符合语义化版本规范

## 发布流程示例

### 场景 1: 发布新功能

```bash
# 1. 开发完成后创建 changeset
pnpm changeset
# 选择: minor, 描述新功能

# 2. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 3. 更新版本
pnpm changeset version

# 4. 提交版本变更
git add .
git commit -m "chore: release"

# 5. 发布
pnpm release

# 6. 推送到远程
git push --follow-tags
```

### 场景 2: 发布 Bug 修复

```bash
# 1. 修复完成后创建 changeset
pnpm changeset
# 选择: patch, 描述修复内容

# 2. 提交代码
git add .
git commit -m "fix: 修复 bug"

# 3. 更新版本
pnpm changeset version

# 4. 提交版本变更
git add .
git commit -m "chore: release"

# 5. 发布
pnpm release

# 6. 推送到远程
git push --follow-tags
```

## 包发布配置

所有包都配置了 `publishConfig`:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

这确保包以公开方式发布到 npm。

## 发布后验证

发布后验证包是否可用：

```bash
# 检查包信息
npm info @ouraihub/core

# 安装测试
npm install @ouraihub/core@latest
```

## 回滚发布

如果发布出现问题，可以使用 npm deprecate：

```bash
npm deprecate @ouraihub/core@0.1.0 "This version has critical bugs, please upgrade to 0.1.1"
```

**注意**: npm 不支持删除已发布的包版本（24小时后），只能标记为废弃。

## CI/CD 集成

GitHub Actions 自动发布：

```yaml
name: Release

on:
  push:
    branches:
      - master

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.15.0

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      
      - run: pnpm install --frozen-lockfile
      
      - name: Create version PR or publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 故障排查

### 问题: 发布失败 "You do not have permission to publish"

**解决**: 确保你已登录 npm 并有 @ouraihub 组织的发布权限

```bash
npm login
npm org ls @ouraihub
```

### 问题: 版本号冲突

**解决**: 确保版本号唯一，检查 npm 上已发布的版本

```bash
npm info @ouraihub/core versions
```

### 问题: 构建失败

**解决**: 确保所有依赖已安装，构建脚本正确

```bash
pnpm install
pnpm build
```

## 相关资源

- [Changesets 文档](https://github.com/changesets/changesets)
- [npm 发布文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)

---

**维护者**: Sisyphus (AI Agent)  
**最后更新**: 2026-05-13
