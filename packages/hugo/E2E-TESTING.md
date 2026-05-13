# E2E 测试快速开始

## 一键运行

```bash
# 1. 安装依赖和浏览器
cd packages/hugo
pnpm install
pnpm exec playwright install

# 2. 启动 Hugo 服务器（新终端）
cd ../../hugo-theme-paper
hugo server

# 3. 运行测试（原终端）
cd ../ui-library/packages/hugo
pnpm test:e2e
```

## 测试内容

✅ 主题切换 (light ↔ dark)  
✅ 主题持久化（刷新保持）  
✅ 系统主题跟随  
✅ 跨页面一致性  
✅ 防闪烁机制  
✅ 键盘访问性  
✅ 并发切换稳定性

## 常用命令

```bash
pnpm test:e2e           # 运行所有测试
pnpm test:e2e:ui        # UI 模式（推荐）
pnpm test:e2e:headed    # 显示浏览器
pnpm test:e2e:debug     # 调试模式
```

详细文档：[__tests__/e2e/README.md](./__tests__/e2e/README.md)
