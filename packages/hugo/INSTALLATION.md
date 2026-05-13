# E2E 测试安装和运行指南

## 当前状态

✅ 已完成：
- Playwright 配置文件 (`playwright.config.ts`)
- E2E 测试用例 (`__tests__/e2e/theme-toggle.spec.ts`)
- 测试文档 (`__tests__/e2e/README.md`)
- package.json 脚本配置

⚠️ 待完成：
- 安装 @playwright/test 依赖
- 安装 Playwright 浏览器

## 安装步骤

### 1. 安装依赖

由于当前网络连接问题，请在网络恢复后运行：

```bash
cd E:\workspace\ui-dev\ui-library
pnpm install
```

或者单独安装 Hugo 包的依赖：

```bash
cd E:\workspace\ui-dev\ui-library\packages\hugo
pnpm install
```

### 2. 安装 Playwright 浏览器

```bash
cd E:\workspace\ui-dev\ui-library\packages\hugo
pnpm exec playwright install
```

或者只安装 Chromium（最快）：

```bash
pnpm exec playwright install chromium
```

### 3. 启动 Hugo 服务器

在一个终端中：

```bash
cd E:\workspace\ui-dev\hugo-theme-paper
hugo server
```

确保服务器运行在 `http://localhost:1313`

### 4. 运行测试

在另一个终端中：

```bash
cd E:\workspace\ui-dev\ui-library\packages\hugo
pnpm test:e2e
```

## 测试覆盖

测试文件 `__tests__/e2e/theme-toggle.spec.ts` 包含 9 个测试用例：

1. ✅ 用户点击主题切换按钮 (light → dark → light)
2. ✅ 主题持久化 - 刷新页面后保持
3. ✅ 系统主题跟随 - 模拟系统主题变化
4. ✅ 跨页面主题一致性 - 导航到不同页面
5. ✅ 防闪烁机制 - 页面加载时无闪烁
6. ✅ 键盘访问性 - Tab + Enter 切换主题
7. ✅ 主题切换按钮可访问性属性
8. ✅ 三态切换 - light → dark → system → light
9. ✅ 并发主题切换 - 快速点击不会导致状态错误

## 测试架构

- **测试框架**: Playwright
- **浏览器**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **测试策略**: 完全并行，自动重试，智能等待
- **报告**: HTML 报告 + 列表输出

## 故障排查

### 依赖安装失败

如果 `pnpm install` 失败，尝试：

```bash
# 清理缓存
pnpm store prune

# 重新安装
pnpm install
```

### 浏览器安装失败

如果 Playwright 浏览器下载失败，可以设置镜像：

```bash
# 使用国内镜像
$env:PLAYWRIGHT_DOWNLOAD_HOST="https://npmmirror.com/mirrors/playwright"
pnpm exec playwright install
```

### Hugo 服务器未启动

确保 Hugo 服务器正在运行：

```bash
# 检查端口
netstat -ano | findstr :1313

# 访问测试
curl http://localhost:1313
```

### 测试超时

如果测试超时，增加超时时间：

```bash
# 在 playwright.config.ts 中设置
timeout: 60000  # 60 秒
```

## 下一步

安装完成后，可以：

1. 运行完整测试套件：`pnpm test:e2e`
2. 使用 UI 模式调试：`pnpm test:e2e:ui`
3. 查看测试报告：`pnpm exec playwright show-report`
4. 添加更多测试用例到 `__tests__/e2e/` 目录

## 文件清单

```
packages/hugo/
├── playwright.config.ts           # Playwright 配置
├── package.json                   # 包含 test:e2e 脚本
├── E2E-TESTING.md                # 快速开始指南
├── INSTALLATION.md               # 本文件
└── __tests__/
    └── e2e/
        ├── README.md             # 详细测试文档
        └── theme-toggle.spec.ts  # 主题切换测试
```

## 参考资源

- [Playwright 官方文档](https://playwright.dev)
- [Hugo 官方文档](https://gohugo.io)
- [项目 CLAUDE.md](../../CLAUDE.md)
