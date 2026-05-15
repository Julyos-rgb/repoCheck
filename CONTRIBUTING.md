# 贡献指南

感谢你对 RepoCheck 项目的关注！欢迎任何形式的贡献。

## 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/Julyos-rgb/repoCheck.git
cd repoCheck

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 启动开发服务器
npm run dev
```

## 代码规范

- 使用 TypeScript 编写所有代码，禁止使用 `any`
- 遵循 ESLint 规则，提交前确保 `npm run lint` 无错误
- 使用 Tailwind CSS 进行样式编写
- 组件使用 `"use client"` 标记客户端组件
- 保持代码简洁，避免过度封装

## Commit 规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>
```

类型说明：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `chore`: 构建/工具变更

示例：
```
feat(chart): add contributor ranking chart
fix(api): handle GitHub API rate limit error
docs: update README with screenshot
```

## PR 提交流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 提交代码：遵循 Commit 规范
4. 确保通过检查：`npm run lint` 和 `npm run build` 无错误
5. 推送到你的 Fork：`git push origin feat/your-feature`
6. 创建 Pull Request，填写 PR 模板

## Bug 报告

如果发现 Bug，请通过 [GitHub Issues](https://github.com/Julyos-rgb/repoCheck/issues/new?template=bug_report.md) 提交，包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 截图（如有）

## 功能建议

欢迎通过 [GitHub Issues](https://github.com/Julyos-rgb/repoCheck/issues/new?template=feature_request.md) 提出功能建议。

## 许可证

提交代码即表示你同意在 MIT 许可证下发布你的贡献。
