# 任务提示词

你需要在 ui-library 中创建 `packages/hugo-shared` 共享模块，然后让 hugo-theme-paper 接入它。

## 项目路径

- ui-library: `/home/administrator/workspace/open-source/ui-dev/ui-library`
- hugo-theme-paper: `/home/administrator/workspace/open-source/hugo-theme-paper`

## 你的任务

严格按照 `docs/hugo-shared-design.md` 中的 13 个步骤执行。

## 执行规则

1. **先读 `docs/hugo-shared-design.md`**，完整理解架构和所有步骤
2. **按顺序执行**，不要跳步
3. **步骤 1-6 在 ui-library 中操作**（创建 hugo-shared 包）
4. **步骤 7 先用 `file:` 协议本地测试**，不要直接 npm publish：
   ```json
   "@ouraihub/hugo-shared": "file:../../ui-dev/ui-library/packages/hugo-shared"
   ```
   验证通过后再走 changeset 发布流程
5. **步骤 8-13 在 hugo-theme-paper 中操作**（接入 shared）
6. **遇到文档没覆盖的情况**，停下来问我，不要猜

## 环境准备

```bash
# ui-library
cd /home/administrator/workspace/open-source/ui-dev/ui-library
pnpm install

# hugo-theme-paper（确认能跑）
cd /home/administrator/workspace/open-source/hugo-theme-paper
pnpm install
pnpm dev  # 确认当前正常，访问 http://localhost:1313
```

## 验收标准

全部完成后在 hugo-theme-paper 中运行：

```bash
pnpm dev
```

访问 http://localhost:1313 确认：
- 首页正常渲染
- 文章页代码高亮正常（亮/暗切换）
- 代码复制按钮工作
- 返回顶部按钮工作
- 主题切换正常
- 语言切换正常
- 分享链接显示
- 查看源码：og:title 只出现 1 次
- 查看源码：有 BreadcrumbList schema

然后确认共享模块生效：
```bash
ls layouts/partials/shared/          # 应该有 9 个 html 文件
grep -r "ouraihub/hugo-shared" package.json  # 应该有依赖
grep -r "from './modules'" assets/ts/  # 应该无结果（已改为 from '@ouraihub/hugo-shared'）
```

全部通过后告诉我"共享模块接入完成"。

开始吧。先读 `docs/hugo-shared-design.md`，然后从步骤 1 开始。
