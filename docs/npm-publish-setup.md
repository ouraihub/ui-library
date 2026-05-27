# NPM 发布配置指南

## 问题背景

CI 自动发布 `@ouraihub/*` scoped 包到 npm 时，遇到 EOTP/E403 错误，无法完成发布。

## 根本原因

npm 对 scoped 包发布有以下安全策略叠加：

1. **包级别**：新包默认要求 "2FA or granular token with bypass 2fa enabled"
2. **账号级别**：如果账号开启了 2FA（Authorization and Publishing 模式），所有 publish 操作都需要 OTP
3. **Token 级别**：Granular Access Token 必须在创建时勾选 "Bypass 2FA" 才能在 CI 中免 OTP 发布

三者缺一不可。

## 正确配置步骤

### 1. npm 账号 2FA 设置

- 账号：`ouraihub-ci`
- 地址：https://www.npmjs.com/settings/ouraihub-ci/tfa
- 要求：**必须开启 2FA**（否则创建 token 时看不到 bypass 选项）
- 模式：Authorization and Publishing（保持默认即可）

### 2. 创建 Granular Access Token

- 地址：https://www.npmjs.com/settings/ouraihub-ci/tokens/granular-access-tokens/new
- 配置：
  - Token name: `github-actions-publish`（或任意名称）
  - **☑ Bypass two-factor authentication for automation**（必须勾选！）
  - Packages: **All packages**（Read and write）
  - Organizations: **ouraihub**
  - Expiration: 按需设置（最长 90 天，到期需续期）

### 3. GitHub Secrets 配置

- 地址：https://github.com/ouraihub/ui-library/settings/secrets/actions
- Secret name: `NPM_TOKEN`
- Value: 上一步生成的 token

### 4. Token 过期续期

Granular token 有过期时间（最长 90 天）。到期前需要：
1. 去 npm 创建新 token（同样配置）
2. 更新 GitHub Secrets 的 `NPM_TOKEN` 值

## 发布流程

### 自动发布（推荐）

1. 开发完成后添加 changeset：`pnpm changeset`
2. 提交 PR 并合并到 master
3. `Release` workflow 自动运行 → 创建 Release PR 或直接发布

### 手动发布

1. GitHub Actions → NPM Publish → Run workflow → 选 master 分支

## 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `EOTP` | Token 没有 bypass 2FA 权限 | 重新创建 token，勾选 bypass 2FA |
| `E404 Not Found` | Token 无权创建新包 | 确认 token 选了 "All packages" |
| `E403 Forbidden` | 账号 2FA 关闭但包要求 2FA token | 开启账号 2FA 后重新创建带 bypass 的 token |
| Coverage threshold | 测试覆盖率不达标 | 补充测试，全局需 ≥80% |

## 关键要点

> **创建 Granular token 时必须勾选 "Bypass two-factor authentication for automation"，这个选项只有在账号 2FA 开启时才会出现。**
